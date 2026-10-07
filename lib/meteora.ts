/**
 * Meteora Dynamic Bonding Curve 集成
 * ============================================================
 * SDK: @meteora-ag/dynamic-bonding-curve-sdk (^1.5.11)
 *
 * 费用模型（对标 gomo，10 档）：
 * - 平台为每一档 creator 分成（0–9%）各建一个 config，共 10 个
 * - 每个 config 的 feeClaimer = PLATFORM_FEE_WALLET（平台钱包）
 * - 总费率公式：total = (creator% + 平台 1%) / 0.8
 *   （Meteora 协议抽 20%，已用 gomo 公开数据反推验证：
 *    0% 档 → 1.25%，5% 档 → 7.5%，9% 档 → 12.5% ✓）
 * - creatorTradingFeePercentage（u8，0–100）= creator 在非协议费中的占比
 *
 * 用户决策（2026-10-07）：直接上主网，不走 devnet。
 * 每个 config 创建约 0.006 SOL 租金 × 10 = 约 0.06 SOL，一次性。
 */

import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { DynamicBondingCurveClient, type CreatePoolParams } from "@meteora-ag/dynamic-bonding-curve-sdk";
import BN from "bn.js";
import {
  DBC_PROGRAM_ID,
  MAINNET_RPC,
  PLATFORM_CONFIGS_MAINNET,
  PLATFORM_FEE_WALLET,
  WSOL_MINT,
  INCINERATOR,
} from "./constants";

export type Network = "mainnet"; // 用户决策：直接主网

export function getConnection(): Connection {
  const endpoint = process.env.NEXT_PUBLIC_MAINNET_RPC || MAINNET_RPC;
  return new Connection(endpoint, "confirmed");
}

export function getClient(connection: Connection): DynamicBondingCurveClient {
  return new DynamicBondingCurveClient(connection, "confirmed");
}

/** 10 档费率（gomo 同款数学） */
export interface FeeTier {
  tier: number; // 发币人分成档位 0–9
  creatorPct: number; // 发币人拿走交易额的 %
  platformPct: number; // 平台拿走交易额的 %（固定 ~1%）
  protocolPct: number; // Meteora 协议 20%
  totalFeePct: number; // 池子总费率
  cliffFeeNumerator: BN; // 总费率 → SDK 分子（FEE_DENOMINATOR=1e9）
  creatorShareU8: number; // creatorTradingFeePercentage（u8）
}

function buildTier(tier: number): FeeTier {
  const creatorPct = tier;
  const platformPct = 1;
  const totalFeePct = (creatorPct + platformPct) / 0.8;
  return {
    tier,
    creatorPct,
    platformPct,
    protocolPct: 20,
    totalFeePct,
    cliffFeeNumerator: new BN(Math.round(totalFeePct * 1e7).toString()),
    creatorShareU8:
      creatorPct === 0 ? 0 : Math.round((creatorPct / (creatorPct + platformPct)) * 100),
  };
}

export const FEE_TIERS: FeeTier[] = Array.from({ length: 10 }, (_, i) => buildTier(i));

export function getPlatformConfig(tier: number): PublicKey {
  const addr = PLATFORM_CONFIGS_MAINNET[tier];
  if (!addr || addr === "11111111111111111111111111111111") {
    throw new Error(`第 ${tier}% 档的 config 还没创建，请先建 config`);
  }
  return new PublicKey(addr);
}

/**
 * 建 config（每档一次，共 10 次，每次约 0.006 SOL）
 * 必须由用户钱包签名。config 建好后把地址填入 constants → PLATFORM_CONFIGS_MAINNET
 */
export async function buildCreateConfigTx(params: {
  connection: Connection;
  payer: PublicKey;
  tier: number;
}): Promise<{ tx: Transaction; configKeypair: Keypair }> {
  const { connection, payer, tier } = params;
  if (tier < 0 || tier > 9) throw new Error("tier 必须是 0–9");
  const fee = FEE_TIERS[tier];
  const client = getClient(connection);
  const configKeypair = Keypair.generate();

  const tx: Transaction = await client.partner.createConfig({
    payer,
    config: configKeypair.publicKey,
    feeClaimer: PLATFORM_FEE_WALLET, // ★ 平台费归集到用户钱包
    leftoverReceiver: PLATFORM_FEE_WALLET,
    quoteMint: WSOL_MINT, // SOL 本位
    poolFees: {
      baseFee: {
        cliffFeeNumerator: fee.cliffFeeNumerator,
        numberOfPeriod: 0,
        reductionFactor: new BN("0"),
        periodFrequency: new BN("0"),
        feeSchedulerMode: 0,
      },
      dynamicFee: {
        binStep: 1,
        binStepU128: new BN("1844674407370955"),
        filterPeriod: 10,
        decayPeriod: 120,
        reductionFactor: 1000,
        variableFeeControl: 100000,
        maxVolatilityAccumulator: 100000,
      },
    },
    activationType: 0,
    collectFeeMode: 0, // 只收 SOL 费用
    migrationOption: 0, // 毕业迁移 DAMM v2
    tokenType: 0,
    tokenDecimal: 6, // 6 位小数（gomo 同款）
    migrationQuoteThreshold: new BN("15000000000"), // ~15 SOL，按 gomo 约 $15k 市值毕业思路；SOL 价格波动时复核
    partnerLpPercentage: 0,
    creatorLpPercentage: 0,
    partnerLockedLpPercentage: 50, // 毕业后 LP 永久锁定（防跑路卖点）
    creatorLockedLpPercentage: 50,
    sqrtStartPrice: new BN("58333726687135158"), // TODO: 用 buildCurveWithMarketCap 按目标开盘市值精算
    lockedVesting: {
      amountPerPeriod: new BN("0"),
      cliffDurationFromMigrationTime: new BN("0"),
      frequency: new BN("0"),
      numberOfPeriod: new BN("0"),
      cliffUnlockAmount: new BN("0"),
    },
    migrationFeeOption: 0,
    tokenSupply: {
      preMigrationTokenSupply: new BN("1000000000000000"), // 10 亿 × 10^6
      postMigrationTokenSupply: new BN("1000000000000000"),
    },
    creatorTradingFeePercentage: fee.creatorShareU8,
    padding0: [],
    padding1: [],
    curve: [
      // TODO: 用 buildCurveWithMarketCap 生成精确曲线后替换
      {
        sqrtPrice: new BN("233334906748540631"),
        liquidity: new BN("622226417996106429201027821619672729"),
      },
      {
        sqrtPrice: new BN("79226673521066979257578248091"),
        liquidity: new BN("1"),
      },
    ],
  } as never);

  return { tx, configKeypair };
}

/**
 * 发币（创建 DBC 池 + mint）
 * @param tier 发币人选择的分成档位 0–9
 * @param burnLp 燃烧选项：开启后，毕业时将 LP 凭证转入销毁地址（而非长期锁仓展示）
 */
export async function buildCreatePoolTx(params: {
  connection: Connection;
  payer: PublicKey;
  poolCreator: PublicKey;
  tier: number;
  name: string;
  symbol: string;
  uri: string;
  burnLp: boolean;
}): Promise<{ tx: Transaction; baseMint: PublicKey }> {
  const { connection, payer, poolCreator, tier, name, symbol, uri } = params;
  const client = getClient(connection);
  const config = getPlatformConfig(tier);
  const baseMint = Keypair.generate();

  const poolParams: CreatePoolParams = {
    payer,
    config,
    baseMint: baseMint.publicKey,
    name,
    symbol,
    uri,
    poolCreator,
  };
  const tx = await client.creator.createPool(poolParams);

  // burnLp 意图随发币记录存 Supabase；毕业迁移完成后由平台执行燃烧
  // （将平台份额的 DAMM v2 LP 打入 INCINERATOR，见 buildBurnLpTx）
  void params.burnLp;

  // NOTE: 发池后务必 renounce mint authority + freeze authority，
  // 否则 GMGN/DexScreener 安全评分挂红，影响被捕捉和传播。
  return { tx, baseMint: baseMint.publicKey };
}

/**
 * 燃烧 LP（毕业迁移完成后执行）
 * 将指定数量的 DAMM v2 LP token 转入 Solana 销毁地址。
 * 由费钱包（用户）签名发起。
 */
export async function buildBurnLpTx(_params: {
  connection: Connection;
  payer: PublicKey;
  lpMint: PublicKey;
  amount: BN;
}): Promise<Transaction> {
  // TODO: 迁移流程联调时实现 —— 从用户 LP 账户转账到 INCINERATOR。
  // 需先确认 DAMM v2 迁移后 LP mint 地址与用户持仓账户。
  void _params;
  throw new Error("buildBurnLpTx 待迁移联调后实现");
}

/**
 * 平台领费（feeClaimer = 用户钱包，由用户签名发起，可随时领）
 */
export async function buildClaimFeeTx(params: {
  connection: Connection;
  pool: PublicKey;
  payer: PublicKey;
  receiver?: PublicKey;
}): Promise<Transaction> {
  const { connection, pool, payer, receiver } = params;
  const client = getClient(connection);

  const tx = await client.partner.claimPartnerTradingFee({
    pool,
    feeClaimer: PLATFORM_FEE_WALLET,
    payer,
    maxBaseAmount: new BN(0),
    maxQuoteAmount: new BN(0),
    receiver: receiver ?? PLATFORM_FEE_WALLET,
  } as never);

  return tx as Transaction;
}

export { DBC_PROGRAM_ID, INCINERATOR };
