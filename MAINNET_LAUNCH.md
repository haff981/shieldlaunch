# 主网上线检查单（用户决策：直接主网，不走 devnet）

## 1. 部署网站
```bash
cd ~/workspace/shieldlaunch
# 推到 GitHub（haff981，需用户手动建仓库），Vercel 导入，一键部署
# 域名 DNS：shieldlaunch.life → Vercel（Spaceship 后台加记录）
```

## 2. 建 10 个 config（每档 0–9% 各一个）
- 在网站（或脚本）调用 `buildCreateConfigTx`，每档一次
- 每次约 0.006 SOL，10 个约 0.06 SOL，必须用**费钱包**签名
- 每建好一个，把地址填入 `lib/constants.ts` → `PLATFORM_CONFIGS_MAINNET`
- ⚠️ config 建好不可改，参数（曲线/阈值/费率）建之前逐个核对

## 3. 发射第一个币
- `/launch` 填名称/ticker，选分成档位，决定是否燃烧 LP
- 签名 → 主网真实 SOL 消耗
- **立即 renounce** mint authority + freeze authority
- 到 GMGN 粘贴 mint 地址，验证被捕捉（new_pairs / 搜索）

## 4. 验证费用归集
- 找几个钱包做几笔买卖
- 调 `buildClaimFeeTx`，确认费钱包能领到 SOL

## 待精算（上线前）
- [ ] `sqrtStartPrice` / curve：用 SDK `buildCurveWithMarketCap` 按目标开盘市值生成
- [ ] `migrationQuoteThreshold`：~15 SOL 按当前 SOL 价格复核（对标 gomo $15k 毕业）
- [ ] 主网 RPC：Helius 免费 key（`NEXT_PUBLIC_MAINNET_RPC`）
- [ ] metadata 存储：图片 + JSON 上 Irys/Arweave
- [ ] `buildBurnLpTx`：迁移联调后实现
