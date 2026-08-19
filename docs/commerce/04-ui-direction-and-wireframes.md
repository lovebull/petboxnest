# UI 视觉方向与关键页面线框图

> 文档状态：待评审
> 版本：0.1
> 说明：当前为品牌中性的设计基线；品牌名称、品类和素材确认后再形成高保真视觉稿。

## 1. 设计目标

商城需要呈现“可信、克制、现代、商品优先”的视觉体验，不模仿 Shopify 后台，也不使用常见的模板化电商堆叠。界面应让品牌内容与购买效率共存：

- 商品图承担主要视觉表达。
- 排版建立品牌感，组件保持克制。
- 购买 CTA 清晰，但不使用持续弹窗和虚假紧迫感。
- 移动端优先，并保证键盘与辅助技术可使用。
- 视觉系统可扩展至邮件、广告落地页和包装物。

## 2. 建议视觉方向

暂定方向：**Modern Editorial Commerce**

关键词：

- Editorial
- Product-led
- Warm neutral
- Clear utility
- Honest confidence

避免：

- 大面积无目的渐变
- 所有内容都塞进圆角卡片
- 过多阴影和玻璃效果
- 虚构评价、倒计时和“仅剩 1 件”等暗黑模式
- Hero 内堆叠多个同级 CTA
- 过密的促销标签

## 3. Design Tokens 初稿

品牌确认后再调整具体值。

### 3.1 Color

```text
Canvas          #F6F4EF   warm off-white
Surface         #FFFFFF
Ink             #171714
Muted Ink       #67675F
Border          #D9D7D0
Soft Surface    #ECE9E1
Primary         #171714
Primary Ink     #FFFFFF
Success         #276749
Warning         #9C6210
Error           #B42318
Focus           #2457D6
```

语义色优先；品牌主色不得替代错误、成功和焦点语义。

### 3.2 Typography

建议组合：

- Display：品牌确认后选择有授权的 Editorial Serif 或 Characterful Sans。
- UI/Body：Inter、Geist 或同类高可读 Sans。

字阶参考：

```text
Display XL   64/68 desktop, 40/44 mobile
Display L    48/52 desktop, 34/38 mobile
Heading 1    36/42
Heading 2    28/34
Heading 3    22/28
Body L       18/28
Body         16/24
Body S       14/20
Label        13/16
```

商品信息、表单和价格不使用过细字重。

### 3.3 Spacing

基础单位 4px，常用序列：

```text
4, 8, 12, 16, 24, 32, 48, 64, 96, 128
```

- 内容最大宽度：1440px。
- Desktop 页面边距：32–64px。
- Mobile 页面边距：16–20px。
- Editorial Section 垂直间距：80–128px desktop，56–80px mobile。

### 3.4 Shape and Elevation

- 控件圆角：4–8px。
- 商品图片可使用 0–4px 圆角。
- Modal/Drawer：8–12px。
- 默认卡片不用阴影，通过间距和边框分层。
- 浮层只使用一档柔和阴影。

### 3.5 Motion

- Hover/press：120–180ms。
- Drawer/Modal：200–280ms。
- 页面内容不做影响阅读的持续动画。
- 尊重 `prefers-reduced-motion`。
- Add to Cart 使用状态反馈，不使用夸张飞入动画。

## 4. 响应式框架

```text
Mobile      320–767
Tablet      768–1023
Desktop     1024–1439
Wide        1440+
```

商品网格：

- Mobile：2 列；极窄设备可保持 2 列但缩减 Gap。
- Tablet：3 列。
- Desktop：4 列。
- Wide：4–5 列，取决于商品图比例。

Checkout：

- Mobile：单列，Order Summary 可折叠。
- Desktop：表单 7/12，摘要 5/12。

## 5. 组件清单

### Navigation

- AnnouncementBar
- Header
- MegaMenu
- MobileMenu
- SearchOverlay
- Breadcrumbs
- Footer

### Commerce

- ProductCard
- ProductGallery
- Price
- VariantSelector
- QuantitySelector
- StockStatus
- AddToCartButton
- CartDrawer
- CartLine
- OrderSummary
- PromoCodeForm
- ShippingMethodCard
- PaymentMethod
- OrderStatus
- TrackingCard
- ReturnItemSelector

### Forms

- TextField
- Select
- Checkbox
- RadioGroup
- AddressForm
- InlineError
- FormSummary

### Feedback

- Toast
- Alert
- Dialog
- Drawer
- Skeleton
- EmptyState
- ErrorState

### Editorial

- Hero
- CollectionFeature
- ProductRail
- SplitStory
- BenefitsRow
- Quote/Press
- NewsletterForm

## 6. 关键页面线框图

线框图表达层级和布局，不代表最终文案、配色与图片。

### 6.1 首页 Desktop

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Announcement: Free US shipping over $XX                                 │
├──────────────────────────────────────────────────────────────────────────┤
│ LOGO     SHOP   NEW   BEST SELLERS   ABOUT       SEARCH  ACCOUNT  BAG(0)│
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Core brand proposition                    [Campaign / Product image]     │
│  One concise supporting sentence                                        │
│  [SHOP THE COLLECTION]                                                   │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│ FEATURED COLLECTIONS                                                     │
│ ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐   │
│ │ Large image        │  │ Large image        │  │ Large image        │   │
│ │ Collection A       │  │ Collection B       │  │ Collection C       │   │
│ └────────────────────┘  └────────────────────┘  └────────────────────┘   │
├──────────────────────────────────────────────────────────────────────────┤
│ BEST SELLERS                                              [VIEW ALL]     │
│ [Product]          [Product]          [Product]          [Product]       │
├──────────────────────────────────────────────────────────────────────────┤
│ [Editorial image]          Brand proof / story                           │
│                            Short paragraph                               │
│                            [OUR STORY]                                   │
├──────────────────────────────────────────────────────────────────────────┤
│ Benefit 01                 Benefit 02                 Benefit 03          │
├──────────────────────────────────────────────────────────────────────────┤
│ Newsletter: useful promise, not generic spam copy      [Email] [JOIN]    │
├──────────────────────────────────────────────────────────────────────────┤
│ Footer                                                                   │
└──────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Collection Desktop

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Header                                                                   │
├──────────────────────────────────────────────────────────────────────────┤
│ Home / Collection                                                        │
│                                                                          │
│ COLLECTION TITLE                                                         │
│ One-line collection context                                              │
│                                                                          │
│ [FILTER]  Active chips                         24 ITEMS   [SORT: Featured]│
├──────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌──────────────┐│
│ │ Product image  │ │ Product image  │ │ Product image  │ │ Product image││
│ └────────────────┘ └────────────────┘ └────────────────┘ └──────────────┘│
│ Name             Name             Name             Name                  │
│ $00.00           $00.00           $00.00           $00.00                │
│                                                                          │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌──────────────┐│
│ │ Product image  │ │ Product image  │ │ Product image  │ │ Product image││
│ └────────────────┘ └────────────────┘ └────────────────┘ └──────────────┘│
├──────────────────────────────────────────────────────────────────────────┤
│                           [LOAD MORE]                                    │
└──────────────────────────────────────────────────────────────────────────┘
```

Product Card 原则：

- 图片、名称、价格是主信息。
- Sale / New / Sold out 标签最多一个主标签。
- Color Swatch 可在确认对商品选择有帮助后加入。
- Quick Add 仅适合单规格或已选默认规格商品，否则进入 PDP。

### 6.3 Product Detail Desktop

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Header                                                                   │
├──────────────────────────────────────────────────────────────────────────┤
│ Home / Collection / Product                                              │
├──────────────────────────────────────────┬───────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐  │ PRODUCT NAME                  │
│ │ Image 1         │ │ Image 2         │  │ $00.00                        │
│ └─────────────────┘ └─────────────────┘  │ Short benefit statement       │
│ ┌─────────────────┐ ┌─────────────────┐  │                               │
│ │ Image 3         │ │ Image 4         │  │ COLOR                         │
│ └─────────────────┘ └─────────────────┘  │ [Black] [Sand] [Blue]         │
│                                          │                               │
│                                          │ SIZE                 Size guide│
│                                          │ [S] [M] [L] [XL]              │
│                                          │                               │
│                                          │ Quantity [- 1 +]               │
│                                          │ [      ADD TO BAG       ]      │
│                                          │                               │
│                                          │ In stock / ships in X days    │
│                                          │ Free shipping over $XX        │
│                                          │ 30-day returns                │
├──────────────────────────────────────────┴───────────────────────────────┤
│ DETAILS                                                                  │
│ Product story and practical information                                  │
├──────────────────────────────────────────────────────────────────────────┤
│ YOU MAY ALSO LIKE                                                        │
│ [Product]          [Product]          [Product]          [Product]       │
└──────────────────────────────────────────────────────────────────────────┘
```

### 6.4 Product Detail Mobile

```text
┌───────────────────────────┐
│ Menu   LOGO   Search Bag  │
├───────────────────────────┤
│                           │
│ Product image carousel    │
│                     1 / 4 │
├───────────────────────────┤
│ PRODUCT NAME              │
│ $00.00                    │
│ Short benefit statement   │
│                           │
│ COLOR                     │
│ [Black] [Sand] [Blue]     │
│                           │
│ SIZE          Size guide  │
│ [S] [M] [L] [XL]         │
│                           │
│ Quantity [- 1 +]          │
│ Shipping / return summary │
├───────────────────────────┤
│ Details accordion         │
├───────────────────────────┤
│ Related products          │
├───────────────────────────┤
│ [ ADD TO BAG — $00.00 ]   │  sticky, when appropriate
└───────────────────────────┘
```

### 6.5 Cart Drawer

```text
                              ┌─────────────────────────────┐
                              │ YOUR BAG               [X] │
                              ├─────────────────────────────┤
                              │ [img] Product name          │
                              │       Variant               │
                              │       [- 1 +]       $00.00  │
                              │       Remove                │
                              ├─────────────────────────────┤
                              │ $XX away from free shipping │
                              │ [progress................]  │
                              ├─────────────────────────────┤
                              │ Subtotal            $00.00  │
                              │ Tax/shipping at checkout    │
                              │ [       CHECKOUT       ]    │
                              │ View bag                    │
                              └─────────────────────────────┘
```

### 6.6 Checkout Desktop

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                                  LOGO                                    │
├──────────────────────────────────────────┬───────────────────────────────┤
│ Contact                                  │ ORDER SUMMARY                 │
│ [Email_______________________________]   │ [img] Product / Variant       │
│                                          │                 Qty 1 $00.00  │
│ Shipping address                         │                               │
│ [First name____] [Last name__________]   │ [Promo code________] [APPLY]  │
│ [Address line 1______________________]   │                               │
│ [Address line 2______________________]   │ Subtotal              $00.00  │
│ [City________] [State__] [ZIP________]   │ Shipping              $00.00  │
│                                          │ Tax                   $00.00  │
│ Delivery                                 │ Total USD             $00.00  │
│ ( ) Standard — 3–5 days       $X.XX      │                               │
│ ( ) Expedited — 1–2 days      $X.XX      │                               │
│                                          │                               │
│ Payment                                 │                               │
│ [Stripe secure payment element]          │                               │
│ [PayPal]                                 │                               │
│                                          │                               │
│ [             PLACE ORDER             ]  │                               │
│ By placing an order...                   │                               │
└──────────────────────────────────────────┴───────────────────────────────┘
```

### 6.7 Account Orders

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ACCOUNT                                                                  │
├───────────────────┬──────────────────────────────────────────────────────┤
│ Profile           │ ORDERS                                               │
│ Addresses         │                                                      │
│ Orders            │ #1042   Jun 12, 2026   $120.00   Shipped [View]     │
│ Sign out          │ #1018   May 03, 2026   $84.00    Delivered [View]   │
└───────────────────┴──────────────────────────────────────────────────────┘
```

Mobile 使用顶部页面标题和简洁 Tabs，不保留窄侧栏。

### 6.8 Return Request

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ REQUEST A RETURN                                                         │
│ Order #1042                                                              │
├──────────────────────────────────────────────────────────────────────────┤
│ [ ] [img] Product A / Black / M        Qty to return [1 v]               │
│ [ ] [img] Product B / Sand / L         Qty to return [1 v]               │
├──────────────────────────────────────────────────────────────────────────┤
│ Reason [Select_______________________________________________________]   │
│ Notes  [_____________________________________________________________]   │
│        [_____________________________________________________________]   │
│                                                                          │
│ Return eligibility and fee summary                                       │
│                                                    [SUBMIT RETURN]        │
└──────────────────────────────────────────────────────────────────────────┘
```

## 7. 表单交互规范

- Label 永远可见，不用 Placeholder 代替 Label。
- 必填与选填表达一致。
- 用户离开字段后进行轻量校验，提交时完整校验。
- 错误不清空已输入数据。
- Address Line 2 明确标为 Optional。
- State 使用可搜索 Select 或标准州列表。
- ZIP Code 允许 ZIP+4。
- Place Order 在请求期间显示进度并禁止重复提交。
- Provider 错误转译为用户可理解语言，同时保留内部错误码。

## 8. 可访问性基线

- Skip to content。
- Header、Nav、Main、Footer 使用语义区域。
- 图片有有效 alt；纯装饰图使用空 alt。
- 所有 Drawer/Modal 有标题、焦点管理和 Escape 关闭。
- Swatch 同时有文本名称，不能只靠颜色。
- Sold out 状态可被辅助技术读取。
- Toast 不作为唯一错误载体。
- 触控目标建议不小于 44×44px。

## 9. 内容规范

语气：

- 简明
- 可信
- 不夸张
- 强调实际利益

按钮：

- 使用动作动词，例如 `Add to bag`、`Continue to payment`。
- 避免模糊的 `Submit`、`Click here`。

错误：

- 说明发生了什么，以及用户下一步可以做什么。
- 不直接展示 Provider 原始报错。

库存和促销：

- 只有在数据真实时才显示 Low stock。
- 不使用自动重置的虚假 Countdown。

## 10. 设计交付物

进入开发前建议补齐：

- 品牌 Logo 与使用规则
- 品牌色与字体授权
- 商品摄影规范
- Desktop/Mobile 高保真首页
- Desktop/Mobile Collection
- Desktop/Mobile PDP
- Desktop/Mobile Cart
- Desktop/Mobile Checkout
- Account / Order / Return
- 组件状态表
- Prototype：PDP -> Cart -> Checkout

## 11. 待评审决策

- [ ] 是否接受 Modern Editorial Commerce 方向。
- [ ] 品牌更偏高端、自然、科技、运动还是大众消费。
- [ ] 商品主图比例；默认建议根据品类选择 4:5 或 1:1。
- [ ] 是否有现成 Logo、字体和商品摄影。
- [ ] 首页是否以品牌故事还是单个旗舰商品为主。
- [ ] Product Card 是否允许 Quick Add。
- [ ] Free Shipping Progress 是否启用。
- [ ] Checkout 是否同时展示 PayPal。

## 12. 评审结论

- [ ] 通过
- [ ] 有条件通过
- [ ] 需修改后重审

评审意见：

> 待填写
