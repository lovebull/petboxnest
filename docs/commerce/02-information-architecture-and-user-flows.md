# 页面信息架构与用户流程

> 文档状态：待评审
> 版本：0.1
> 适用范围：美国、英文、USD、单品牌实物商城

## 1. 信息架构原则

- 购买路径优先，核心商品不超过三次点击可达。
- 移动端优先，Header 和商品操作避免堆叠过多入口。
- 分类结构以消费者理解为准，不照搬内部供应链分类。
- URL 稳定、语义化、可分享，并承载筛选和排序状态。
- 政策与信任信息靠近购买决策点，而不只放在 Footer。
- Checkout 降低干扰，不展示完整站点导航。

## 2. Sitemap

```text
/
├── /shop
│   ├── /collections/[handle]
│   ├── /products/[handle]
│   └── /search?q=
├── /cart
├── /checkout
│   ├── /information
│   ├── /shipping
│   ├── /payment
│   └── /confirmation/[public-order-token]
├── /account
│   ├── /login
│   ├── /register
│   ├── /forgot-password
│   ├── /reset-password
│   ├── /profile
│   ├── /addresses
│   ├── /orders
│   └── /orders/[order-id]
├── /returns
│   └── /requests/[return-id]
├── /about
├── /contact
├── /faq
├── /shipping-policy
├── /return-policy
├── /privacy
├── /terms
├── /cookie-preferences
├── /sitemap.xml
└── /404
```

Checkout 可以在实现时采用一个页面内的分步流程；上面的路径表示信息阶段，不强制要求四个独立页面。

## 3. 全局导航

### 3.1 Desktop Header

```text
[Logo]  Shop  New Arrivals  Best Sellers  About       Search  Account  Bag(2)
```

规则：

- Logo 返回首页。
- Shop 可使用两级 Mega Menu，但首期不超过 6 个一级分类。
- 搜索使用 Overlay 或独立结果页。
- Bag 打开 Cart Drawer；用户仍可进入完整 Cart Page。
- Header 可固定，但滚动时降低高度，避免遮挡内容。

### 3.2 Mobile Header

```text
[Menu]       [Logo]       [Search] [Bag]
```

- Account 放入菜单。
- 菜单打开后锁定背景滚动。
- Cart 商品数必须对屏幕阅读器可读。

### 3.3 Footer

```text
Shop           Help               Company           Legal
Collections    Contact            About             Privacy
New Arrivals   FAQ                Shipping          Terms
Best Sellers   Returns            Track Order       Cookies

Email subscription
Social links
Payment marks
Copyright / business identity
```

## 4. 页面职责

### 4.1 Home

目标：建立品牌认知，并把访客导向主推商品。

建议区块顺序：

1. Announcement Bar
2. Header
3. Hero：核心价值主张 + 主 CTA
4. Featured Collections
5. Best Sellers
6. Brand Proof / Key Benefits
7. Editorial Brand Story
8. Social Proof 或 Press Mentions
9. Email Signup
10. Footer

验收重点：

- Hero 只保留一个主目标。
- 首屏出现明确商品入口。
- 所有运营区块有空数据降级方案。

### 4.2 Collection / PLP

目标：帮助用户快速缩小选择范围。

主要区域：

- Breadcrumb
- Collection title / description
- Filter
- Sort
- Product count
- Product grid
- Pagination 或 Load More
- 可选 SEO 文本

默认排序建议：Featured；其他排序：Newest、Price Low to High、Price High to Low。

移动端 Filter 使用 Bottom Sheet；已启用筛选以 Chips 展示并可单独清除。

### 4.3 Search

- 空关键词不发送无意义请求。
- 展示关键词、结果数和更正建议。
- 无结果时提供热门分类、推荐商品和清除筛选入口。
- 搜索结果链接与 Collection 商品卡保持一致。

### 4.4 Product Detail / PDP

主要区域：

```text
Breadcrumb
Product gallery       Product information
                      Title
                      Rating summary（评价上线后）
                      Price / Compare-at price
                      Short value proposition
                      Variant selectors
                      Quantity
                      Add to Bag
                      Shipping / Return summary
                      Trust signals

Description / Details / Materials
Size or usage guide
Related products
Recently viewed（后续）
```

关键规则：

- 规格选择后更新 URL 或保留可分享状态。
- Add to Bag 在移动端可使用底部 Sticky Bar，但不得遮挡系统控件。
- 缺货规格不可选或明确标为 Sold out。
- 配送和退货摘要链接到完整政策。

### 4.5 Cart Drawer

目标：快速反馈，不中断继续购物。

- 商品缩略图、规格、数量、价格
- 删除
- 小计
- Free Shipping Progress（若启用）
- Checkout 主 CTA
- View Cart 次级入口

Cart Drawer 不负责复杂税费和物流计算。

### 4.6 Cart Page

- 商品行与数量编辑
- Promo Code
- 小计
- 税费和运费“在结账时计算”的说明
- Checkout
- Continue Shopping
- 信任与退货摘要

### 4.7 Checkout

推荐一个页面内分三阶段：

```text
Contact & Address -> Delivery -> Payment
```

布局：

```text
Logo
-------------------------------------------------
Form area                         Order summary
-------------------------------------------------
Privacy / Terms links
```

规则：

- Checkout 不展示促销型 Header、Mega Menu 和推荐轮播。
- Desktop 右侧 Order Summary 固定在可视范围内。
- Mobile 默认折叠 Summary，但必须显示总金额。
- 每一步保存有效数据，返回上一步不丢失。
- 错误信息放在字段附近，并在提交失败后聚焦第一个错误。

### 4.8 Order Confirmation

- 明确成功状态
- Order number
- 联系邮箱
- 配送地址和方式
- 商品、税费、运费、折扣和总额
- 下一步说明
- 注册账户提示（游客）
- 不通过连续可猜 ID 暴露订单

### 4.9 Account

Dashboard 保持轻量：

- Welcome
- Recent orders
- Default address
- Profile shortcuts
- Sign out

Order Detail 复用订单摘要组件，并提供 Tracking、退款和符合条件时的 Return Request。

### 4.10 Content and Policy Pages

- About：品牌使命、来源、差异化
- Contact：表单、邮箱、响应时间
- FAQ：购买前常见问题
- Shipping Policy：范围、费用、处理与配送时间
- Return Policy：期限、条件、费用和流程
- Privacy / Terms：正式法律文本

## 5. 核心用户流程

### 5.1 浏览到购买

```text
Landing Page
  -> Collection/Search
  -> Product Detail
  -> Select Variant
  -> Add to Bag
  -> Cart Drawer
  -> Checkout
  -> Contact & US Address
  -> Delivery Quote
  -> Tax Calculation
  -> Stripe/PayPal
  -> Order Confirmation
  -> Confirmation Email
```

异常分支：

- 商品下架：返回 Collection，并给出说明。
- 库存变化：Cart/Checkout 明确提示并要求用户确认新数量。
- 无配送方式：提示地址修正或联系客服。
- 支付失败：保留 Cart 和有效地址，允许更换支付方式重试。

### 5.2 搜索到购买

```text
Search Open
  -> Enter Query
  -> Results
  -> Apply Filter / Sort
  -> Product Detail
  -> Purchase Flow
```

分析事件：

- search
- view_item_list
- select_item
- view_item

### 5.3 游客结账后注册

```text
Guest Purchase
  -> Confirmation
  -> "Create account"
  -> Set Password / Verify Email
  -> Link eligible order
  -> Account Order Detail
```

关联订单必须验证购买邮箱，不可只凭订单号。

### 5.4 注册用户复购

```text
Login
  -> Account / Previous Order
  -> Product Detail
  -> Add to Bag
  -> Checkout with saved address
  -> Confirm
```

保存地址只能减少填写，支付仍按 Provider 的安全策略处理。

### 5.5 退货

```text
Account -> Order Detail
  -> Request Return
  -> Select Items & Quantity
  -> Select Reason
  -> Confirm Return Method
  -> Submit
  -> Support Review
  -> Return Label / Instructions
  -> Carrier Tracking
  -> Warehouse Receipt
  -> Inspection
  -> Refund
  -> Refund Email
```

不符合条件时：

- 显示不可退原因。
- 提供联系客服入口。
- 不承诺系统自动批准。

### 5.6 客服退款

```text
Admin -> Order Search
  -> Order Detail
  -> Refund
  -> Select Lines / Amount
  -> Choose Restock
  -> Add Reason
  -> Review Confirmation
  -> Provider Refund
  -> Internal State Update
  -> Customer Email
```

## 6. 状态与异常页面

每个核心页面都必须设计：

- Loading / Skeleton
- Empty
- Validation Error
- API Error
- Offline / Retry
- Permission Denied（账户/后台）
- Not Found

重点 Empty State：

- Empty Cart：返回 Shop。
- Empty Search：推荐分类。
- No Orders：开始购物。
- No Eligible Return：解释政策。

## 7. URL 与 SEO 约定

- 商品：`/products/[product-handle]`
- 分类：`/collections/[collection-handle]`
- 搜索：`/search?q=keyword&sort=featured&color=black`
- Handle 使用小写英文、数字和连字符。
- Filter URL 的参数顺序规范化，避免产生大量重复索引页。
- Checkout、Account 私有页面设置 noindex。
- 删除商品根据业务选择 301 到替代商品/分类，或返回真实 404/410。

## 8. 埋点映射

| 用户动作 | 事件 |
|---|---|
| 查看列表 | `view_item_list` |
| 选择商品 | `select_item` |
| 查看商品 | `view_item` |
| 加入购物车 | `add_to_cart` |
| 移出购物车 | `remove_from_cart` |
| 查看购物车 | `view_cart` |
| 开始结账 | `begin_checkout` |
| 添加配送信息 | `add_shipping_info` |
| 添加支付信息 | `add_payment_info` |
| 购买成功 | `purchase` |
| 退款完成 | `refund` |
| 搜索 | `search` |

所有电商事件中的价格、币种、商品 ID、Variant ID 和 Order ID 需要统一口径。

## 9. 待评审决策

- [ ] 一级 Shop 分类及其顺序。
- [ ] 是否展示 New Arrivals / Best Sellers 独立入口。
- [ ] Checkout 采用单页分步还是多路由；默认建议单页分步。
- [ ] Cart Drawer 与 Cart Page 是否同时保留；默认建议同时保留。
- [ ] 用户是否可以自助取消未履约订单。
- [ ] 退货是否必须登录账户；默认建议游客通过邮件安全链接也可申请。
- [ ] 是否在 MVP 首页展示评价/社交证明；若无真实数据则不使用虚构内容。

## 10. 评审结论

- [ ] 通过
- [ ] 有条件通过
- [ ] 需修改后重审

评审意见：

> 待填写
