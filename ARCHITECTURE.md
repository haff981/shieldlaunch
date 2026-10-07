# ShieldLaunch 架构

## 一句话
gomo 式 Solana 发币平台：前端发币 → Meteora DBC 联合曲线 → 毕业迁移 DAMM v2。
差异化：**个人资料页展示"我发行的币"**（gomo 没有这栏）。

## 技术栈（全部免费档起步）
| 层 | 选型 | 说明 |
|---|---|---|
| 前端 | Next.js 15 + Tailwind | 部署 Vercel / Cloudflare Pages |
| 钱包 | @solana/wallet-adapter | Phantom / Solflare，用户自签名 |
| 链上 | Meteora DBC SDK | 已审计程序，不自写合约 |
| 数据 | Supabase | token_registry（mint ↔ creator 映射） |
| 索引 | Helius | 余额 / 交易 / webhook |
| 域名 | shieldlaunch.life | Spaceship 已购 |

## 费用流（对标 gomo，10 档）
```
交易者买/卖
  → DBC 池收交易费
    → 20% → Meteora 协议
    → 剩余 80% 按档位拆分：
        发币人自选 0–9%（交易额占比）
        平台 ~1%（交易额占比）→ feeClaimer = E2qx…t6Ro
```
- 10 个 config，每档一个（总费率 = (档位% + 1%) / 0.8）：
  0%→1.25%，1%→2.5%，2%→3.75%，3%→5%，4%→6.25%，
  5%→7.5%，6%→8.75%，7%→10%，8%→11.25%，9%→12.5%
- 每个 config 创建约 0.006 SOL，10 个约 0.06 SOL，一次性。
- 领费：`claimPartnerTradingFee`，由费钱包签名发起，可随时领。
- 毕业：quoteReserve 达阈值（~15 SOL）→ 自动迁移 DAMM v2，LP 按 config 比例永久锁定；若发币时勾选"燃烧 LP"，毕业后 LP 凭证打入销毁地址。

## GMGN / DexScreener 被捕捉条件
1. 标准 SPL mint + 链下 metadata（name/symbol/image）。
2. **renounce mint authority + freeze authority**（发池后立即做，否则安全评分挂红）。
3. 在 DBC 池里有真实交易（GMGN new_pairs 索引所有 Solana DEX，含 Meteora）。
4. （可选）DexScreener 付费置顶加速传播。

## 页面
- `/` 首页：发射列表
- `/launch` 发币向导：名称 / ticker / 图片 / 简介 / 发币人分成 0–9%
- `/token/[mint]` 代币详情：K 线 / 交易 / 毕业进度
- `/profile/[wallet]` 个人资料：**我发行的币**（市值/毕业状态/累计 fee）+ 持仓

## 安全红线
- 不代签、不碰私钥：所有上链动作由用户钱包签名。
- 先 devnet 全流程跑通，再主网。
- 主网 config 创建、首币发射，每步单独确认。
