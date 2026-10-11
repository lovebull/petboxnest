const promotionTranslations = {
  promotions: {
    createPromotionTitle: "创建促销 / Create Promotion",
    tabs: {
      template: "类型 / Type",
      details: "详情 / Details",
      campaign: "营销活动 / Campaign",
    },
    fields: {
      type: "类型 / Type",
    },
    templates: {
      amount_off_products: {
        title: "商品固定金额优惠（指定商品或商品集合）",
        description:
          "Amount off products — Discount specific products or collection of products",
      },
      amount_off_order: {
        title: "订单固定金额优惠（订单总金额减免）",
        description: "Amount off order — Discounts the total order amount",
      },
      percentage_off_product: {
        title: "商品百分比优惠（指定商品按比例减免）",
        description:
          "Percentage off product — Discounts a percentage off selected products",
      },
      percentage_off_order: {
        title: "订单百分比优惠（订单总金额按比例减免）",
        description:
          "Percentage off order — Discounts a percentage of the total order amount",
      },
      buy_get: {
        title: "买 X 赠 Y",
        description: "Buy X Get Y — Buy X product(s), get Y product(s)",
      },
      shipping_discount: {
        title: "免运费（运费全额减免）",
        description:
          "Free shipping — Applies a 100% discount to shipping fees",
      },
    },
    form: {
      type: {
        standard: {
          title: "标准促销",
          description: "Standard — A standard promotion",
        },
        buyget: {
          title: "买赠促销",
          description: "Buy Get — Buy X get Y promotion",
        },
      },
    },
  },
}

export default {
  en: {
    translation: promotionTranslations,
  },
  enGB: {
    translation: promotionTranslations,
  },
  zhCN: {
    translation: promotionTranslations,
  },
}
