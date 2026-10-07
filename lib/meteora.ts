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
import {
  DynamicBondingCurveClient,
  buildCurveWithMarketCap,
  type CreatePoolParams,
} from "@meteora-ag/dynamic-bonding-curve-sdk";
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

/** 发币人档位 → 交易者实际支付的总费率（%），用于卡片 fee 徽标 */
export function totalFeePctForTier(tier: number): number {
  const t = Math.max(0, Math.min(9, Math.round(tier)));
  return FEE_TIERS[t].totalFeePct;
}

export function getPlatformConfig(tier: number): PublicKey {
  const addr = PLATFORM_CONFIGS_MAINNET[tier];
  if (!addr || addr === "11111111111111111111111111111111") {
    throw new Error(`第 ${tier}% 档的 config 还没创建，请先建 config`);
  }
  return new PublicKey(addr);
}

/**
 * 曲线经济参数（创建 config 前最终确认，不可改）
 * - 开盘市值 $5,000 → 毕业市值 $15,000（对标 gomo）
 * - SOL 计价按 SOL_USD 换算；config 建好后阈值锁定为 SOL 数量，
 *   SOL 涨跌会让毕业时的美元市值同向浮动（gomo 同理）
 */
export const CURVE_ECONOMICS = {
  initialMarketCapUsd: 5000,
  migrationMarketCapUsd: 15000,
  solUsd: 120, // 建 config 前按实时 SOL 价格复核
} as const;

/**
 * 建 config（每档一次，共 10 次，每次约 0.006 SOL）
 * 必须由用户钱包签名。config 建好后把地址填入 constants → PLATFORM_CONFIGS_MAINNET
 *
 * 实现说明：整套 ConfigParameters 由 Meteora SDK 的 buildCurveWithMarketCap
 * 按目标市值直接生成（含 curve / sqrtStartPrice / migrationQuoteThreshold），
 * 不手写字段——旧版手写字段名与新版 IDL 已错位，且 migrationOption 误用了
 * 已废弃的 DAMM v1（0），此处修正为 DAMM v2（1）。
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

  const feeBps = Math.round(fee.totalFeePct * 100); // 总费率 → bps（起止相同 = 固定费率）
  const curveParams = buildCurveWithMarketCap({
    token: {
      tokenType: 0, // SPL
      tokenBaseDecimal: 6, // 6 位小数（gomo 同款）
      tokenQuoteDecimal: 9, // SOL
      tokenAuthorityOption: 0,
      totalTokenSupply: 1e9, // 固定 10 亿
      leftover: 0,
    },
    fee: {
      baseFeeParams: {
        baseFeeMode: 0, // 线性（起止相同即固定费率）
        feeSchedulerParam: {
          startingFeeBps: feeBps,
          endingFeeBps: feeBps,
          numberOfPeriod: 0,
          totalDuration: 0,
        },
      },
      dynamicFeeEnabled: true,
      collectFeeMode: 0, // 只收 SOL（quote）费用
      creatorTradingFeePercentage: fee.creatorShareU8,
      poolCreationFee: 0,
      enableFirstSwapWithMinFee: false,
    },
    migration: {
      migrationOption: 1, // ★ DAMM v2（0 = DAMM v1 已废弃，新 config 不可用）
      migrationFeeOption: 0,
      migrationFee: { feePercentage: 0, creatorFeePercentage: 0 },
    },
    liquidityDistribution: {
      // 四项之和必须 =100；设计：迁移后 LP 全部永久锁定（防跑路），平台/发币人各占一半
      partnerLiquidityPercentage: 0,
      partnerPermanentLockedLiquidityPercentage: 50, // 平台侧永久锁定
      creatorLiquidityPercentage: 0,
      creatorPermanentLockedLiquidityPercentage: 50, // 发币人侧永久锁定
    },
    lockedVesting: {
      totalLockedVestingAmount: 0,
      numberOfVestingPeriod: 0,
      cliffUnlockAmount: 0,
      totalVestingDuration: 0,
      cliffDurationFromMigrationTime: 0,
    },
    activationType: 0,
    initialMarketCap: CURVE_ECONOMICS.initialMarketCapUsd / CURVE_ECONOMICS.solUsd,
    migrationMarketCap: CURVE_ECONOMICS.migrationMarketCapUsd / CURVE_ECONOMICS.solUsd,
  });

  const tx: Transaction = await client.partner.createConfig({
    payer,
    config: configKeypair.publicKey,
    feeClaimer: PLATFORM_FEE_WALLET, // ★ 平台费归集到用户钱包
    leftoverReceiver: PLATFORM_FEE_WALLET,
    quoteMint: WSOL_MINT, // SOL 本位
    ...curveParams,
  });

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
