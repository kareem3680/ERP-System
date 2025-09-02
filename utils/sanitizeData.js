const sanitizeObject = (obj, fields) => {
  return Object.fromEntries(
    fields
      .map(([key, valueFn]) => {
        try {
          const value = valueFn(obj);
          return value !== undefined ? [key, value] : null;
        } catch {
          return null;
        }
      })
      .filter(Boolean)
  );
};

exports.sanitizeUser = (user) =>
  sanitizeObject(user, [
    ["id", (u) => u._id],
    ["name", (u) => u.name],
    ["email", (u) => u.email],
    ["phone", (u) => u.phone],
    ["role", (u) => u.role],
    ["profileImage", (u) => u.profileImage],
    ["addresses", (u) => u.addresses],
  ]);

exports.sanitizeCategory = (category) =>
  sanitizeObject(category, [
    ["id", (c) => c._id],
    ["name", (c) => c.name],
    ["image", (c) => c.image],
    ["createdAt", (c) => c.createdAt],
    ["updatedAt", (c) => c.updatedAt],
  ]);

exports.sanitizeBrand = (brand) =>
  sanitizeObject(brand, [
    ["id", (b) => b._id],
    ["name", (b) => b.name],
    ["image", (b) => b.image],
    ["createdAt", (b) => b.createdAt],
    ["updatedAt", (b) => b.updatedAt],
  ]);

exports.sanitizeSubCategory = (subCategory) =>
  sanitizeObject(subCategory, [
    ["id", (s) => s._id],
    ["name", (s) => s.name],
    ["category", (s) => s.category?.name],
    ["createdAt", (s) => s.createdAt],
    ["updatedAt", (s) => s.updatedAt],
  ]);

exports.sanitizeProduct = (product) =>
  sanitizeObject(product, [
    ["id", (p) => p._id],
    ["title", (p) => p.title],
    ["description", (p) => p.description],
    ["quantity", (p) => p.quantity],
    ["sold", (p) => p.sold],
    ["price", (p) => p.price],
    ["discountPercentage", (p) => p.discountPercentage],
    ["priceAfterDiscount", (p) => p.priceAfterDiscount],
    ["imageCover", (p) => p.imageCover],
    ["images", (p) => p.images],
    ["category", (p) => p.category?.name],
    ["subCategories", (p) => p.subCategories?.map((s) => s?.name)],
    ["brand", (p) => p.brand?.name],
    ["ratingsAverage", (p) => p.ratingsAverage],
    ["ratingsQuantity", (p) => p.ratingsQuantity],
    ["createdAt", (p) => p.createdAt],
    ["updatedAt", (p) => p.updatedAt],
    [
      "reviews",
      (p) =>
        Array.isArray(p.reviews)
          ? p.reviews.map((r) =>
              sanitizeObject(r, [
                ["title", (x) => x.title],
                ["rating", (x) => x.rating],
                ["user", (x) => x.user?.name],
                ["createdAt", (x) => x.createdAt],
              ])
            )
          : undefined,
    ],
  ]);

exports.sanitizeAddress = (address) =>
  sanitizeObject(address, [
    ["id", (a) => a._id],
    ["alias", (a) => a.alias],
    ["details", (a) => a.details],
    ["phone", (a) => a.phone],
    ["country", (a) => a.country],
    ["postalCode", (a) => a.postalCode],
    ["city", (a) => a.city],
  ]);

exports.sanitizeReview = (review) =>
  sanitizeObject(review, [
    ["id", (r) => r._id],
    ["title", (r) => r.title],
    ["rating", (r) => r.rating],
    ["user", (r) => r.user?.name],
    ["product", (r) => r.product],
    ["createdAt", (r) => r.createdAt],
  ]);

exports.sanitizeCoupon = (coupon) =>
  sanitizeObject(coupon, [
    ["id", (c) => c._id],
    ["code", (c) => c.code],
    ["discount", (c) => c.discount],
    ["expire", (c) => c.expire],
  ]);

exports.sanitizeSetting = (setting) =>
  sanitizeObject(setting, [
    ["id", (s) => s._id],
    ["key", (s) => s.key],
    ["value", (s) => s.value],
  ]);

exports.sanitizeCart = (cart) =>
  sanitizeObject(cart, [
    ["id", (c) => c._id],
    ["user", (c) => c.user],
    [
      "cartItems",
      (c) =>
        c.cartItems?.map((item) =>
          sanitizeObject(item, [
            ["id", (i) => i._id],
            [
              "product",
              (i) =>
                i.product &&
                sanitizeObject(i.product, [
                  ["title", (p) => p.title],
                  ["imageCover", (p) => p.imageCover],
                  ["price", (p) => p.price],
                  ["discountPercentage", (p) => p.discountPercentage],
                  ["priceAfterDiscount", (p) => p.priceAfterDiscount],
                  ["ratingsAverage", (p) => p.ratingsAverage],
                ]),
            ],
            ["color", (i) => i.color],
            ["price", (i) => i.price],
            ["quantity", (i) => i.quantity],
          ])
        ),
    ],
    ["totalPrice", (c) => c.totalPrice],
    ["totalPriceAfterDiscount", (c) => c.totalPriceAfterDiscount],
  ]);

exports.sanitizeOrder = (order) =>
  sanitizeObject(order, [
    ["id", (o) => o._id],
    ["orderNumber", (o) => o.orderNumber],
    ["customer", (o) => o.customer],
    [
      "items",
      (o) =>
        o.items?.map((item) =>
          sanitizeObject(item, [
            ["id", (i) => i._id],
            ["quantity", (i) => i.quantity],
            ["price", (i) => i.price],
            [
              "product",
              (i) =>
                typeof i.product === "object"
                  ? sanitizeObject(i.product, [
                      ["id", (p) => p._id],
                      ["title", (p) => p.title],
                      ["imageCover", (p) => p.imageCover],
                    ])
                  : i.product,
            ],
          ])
        ),
    ],
    ["shippingAddress", (o) => o.shippingAddress],
    ["cartPrice", (o) => o.cartPrice],
    ["taxes", (o) => o.taxes],
    ["shipping", (o) => o.shipping],
    ["totalOrderPrice", (o) => o.totalOrderPrice],
    ["status", (o) => o.status],
    ["paymentMethod", (o) => o.paymentMethod],
    ["isPaid", (o) => o.isPaid],
    ["paidAt", (o) => o.paidAt],
    ["deliveredAt", (o) => o.deliveredAt],
    ["createdAt", (o) => o.createdAt],
  ]);

exports.sanitizeWarehouse = (warehouse) =>
  sanitizeObject(warehouse, [
    ["id", (w) => w._id],
    ["name", (w) => w.name],
    ["location", (w) => w.location],
    ["createdAt", (w) => w.createdAt],
    ["updatedAt", (w) => w.updatedAt],
  ]);

exports.sanitizeInventoryItem = (item) =>
  sanitizeObject(item, [
    ["id", (i) => i._id],
    [
      "product",
      (i) =>
        typeof i.product === "object"
          ? sanitizeObject(i.product, [
              ["id", (p) => p._id],
              ["title", (p) => p.title],
              ["imageCover", (p) => p.imageCover],
            ])
          : i.product,
    ],
    [
      "warehouse",
      (i) =>
        typeof i.warehouse === "object"
          ? sanitizeObject(i.warehouse, [
              ["id", (w) => w._id],
              ["name", (w) => w.name],
              ["location", (w) => w.location],
            ])
          : i.warehouse,
    ],
    ["quantityOnHand", (i) => i.quantityOnHand],
    ["reservedQuantity", (i) => i.reservedQuantity],
    ["damagedQuantity", (i) => i.damagedQuantity],
    ["createdAt", (i) => i.createdAt],
    ["updatedAt", (i) => i.updatedAt],
  ]);

exports.sanitizeInventoryMovement = (movement) =>
  sanitizeObject(movement, [
    ["id", (m) => m._id],
    ["type", (m) => m.type],
    ["quantity", (m) => m.quantity],
    ["note", (m) => m.note],
    ["purchaseOrder", (m) => m.purchaseOrder],
    ["product", (m) => m.product?.title || m.product],
    ["warehouse", (m) => m.warehouse?.name || m.warehouse],
    ["fromWarehouse", (m) => m.fromWarehouse?.name || m.fromWarehouse],
    ["toWarehouse", (m) => m.toWarehouse?.name || m.toWarehouse],
    ["sourceStatus", (m) => m.sourceStatus],
    ["targetStatus", (m) => m.targetStatus],
    ["createdBy", (m) => m.createdBy?.name || m.createdBy],
    ["createdAt", (m) => m.createdAt],
    ["updatedAt", (m) => m.updatedAt],
  ]);

exports.sanitizeSupplier = (supplier) =>
  sanitizeObject(supplier, [
    ["id", (s) => s._id],
    ["name", (s) => s.name],
    ["email", (s) => s.email],
    ["phone", (s) => s.phone],
    ["address", (s) => s.address],
    ["companyName", (s) => s.companyName],
    ["products", (s) => s.products],
    ["createdAt", (s) => s.createdAt],
    ["updatedAt", (s) => s.updatedAt],
  ]);

exports.sanitizePurchaseOrder = (order) =>
  sanitizeObject(order, [
    ["id", (o) => o._id],
    ["orderNumber", (o) => o.orderNumber],
    ["supplier", (o) => o.supplier],
    ["orderDate", (o) => o.orderDate],
    ["status", (o) => o.status],
    [
      "items",
      (o) =>
        o.items?.map((item) =>
          sanitizeObject(item, [
            ["product", (i) => i.product?.title],
            ["quantity", (i) => i.quantity],
            ["unitPrice", (i) => i.unitPrice],
            ["totalPrice", (i) => i.totalPrice],
          ])
        ),
    ],
    ["subTotal", (o) => o.subTotal],
    ["taxes", (o) => o.taxes],
    ["shipping", (o) => o.shipping],
    ["totalAmount", (o) => o.totalAmount],
    ["notes", (o) => o.notes],
    ["createdAt", (o) => o.createdAt],
    ["updatedAt", (o) => o.updatedAt],
  ]);

exports.sanitizeTransaction = (transaction) =>
  sanitizeObject(transaction, [
    ["id", (t) => t._id],
    ["transactionNumber", (t) => t.transactionNumber],
    ["type", (t) => t.type],
    [
      "order",
      (t) =>
        t.order
          ? sanitizeObject(t.order, [
              ["id", (o) => o._id],
              ["orderNumber", (o) => o.orderNumber],
              ["totalOrderPrice", (o) => o.totalOrderPrice],
            ])
          : undefined,
    ],
    [
      "warehouse",
      (t) =>
        t.warehouse
          ? sanitizeObject(t.warehouse, [
              ["id", (w) => w._id],
              ["name", (w) => w.name],
              ["location", (w) => w.location],
            ])
          : undefined,
    ],
    [
      "items",
      (t) =>
        t.items?.map((item) =>
          sanitizeObject(item, [
            [
              "product",
              (i) =>
                i.product
                  ? sanitizeObject(i.product, [
                      ["id", (p) => p._id],
                      ["title", (p) => p.title],
                      ["imageCover", (p) => p.imageCover],
                    ])
                  : undefined,
            ],
            ["quantity", (i) => i.quantity],
            ["price", (i) => i.price],
          ])
        ),
    ],
    ["totalAmount", (t) => t.totalAmount],
    [
      "createdBy",
      (t) =>
        t.createdBy
          ? sanitizeObject(t.createdBy, [
              ["id", (u) => u._id],
              ["name", (u) => u.name],
              ["email", (u) => u.email],
            ])
          : undefined,
    ],
    ["createdAt", (t) => t.createdAt],
    ["returnOf", (t) => (t.returnOf ? t.returnOf : undefined)],
  ]);

exports.sanitizeNotification = (n) =>
  sanitizeObject(n, [
    ["id", (n) => n._id],
    ["title", (n) => n.title],
    ["message", (n) => n.message],
    ["module", (n) => n.module],
    ["importance", (n) => n.importance],
    ["from", (n) => n.from],
    ["toRole", (n) => n.toRole],
    [
      "toUser",
      (n) =>
        n.toUser
          ? sanitizeObject(n.toUser, [
              ["id", (u) => u._id],
              ["name", (u) => u.name],
              ["email", (u) => u.email],
            ])
          : undefined,
    ],
    ["status", (n) => n.status],
    ["createdAt", (n) => n.createdAt],
    ["updatedAt", (n) => n.updatedAt],
  ]);

exports.sanitizeClient = (client) =>
  sanitizeObject(client, [
    ["id", (c) => c._id],
    ["name", (c) => c.name],
    ["email", (c) => c.email],
    ["phone", (c) => c.phone],
    ["company", (c) => c.company],
    ["address", (c) => c.address],
    ["notes", (c) => c.notes],
    [
      "assignedTo",
      (c) =>
        typeof c.assignedTo === "object"
          ? sanitizeObject(c.assignedTo, [
              ["id", (u) => u._id],
              ["name", (u) => u.name],
              ["email", (u) => u.email],
            ])
          : c.assignedTo,
    ],
    ["createdAt", (c) => c.createdAt],
    ["updatedAt", (c) => c.updatedAt],
  ]);

exports.sanitizeProject = (project) =>
  sanitizeObject(project, [
    ["id", (p) => p._id],
    ["title", (p) => p.title],
    ["description", (p) => p.description],
    ["status", (p) => p.status],
    ["startDate", (p) => p.startDate],
    ["endDate", (p) => p.endDate],
    [
      "client",
      (p) => (p.client ? exports.sanitizeClient(p.client) : undefined),
    ],
    [
      "assignedTo",
      (p) =>
        Array.isArray(p.assignedTo)
          ? p.assignedTo.map((user) =>
              sanitizeObject(user, [
                ["id", (u) => u._id],
                ["name", (u) => u.name],
              ])
            )
          : undefined,
    ],
    [
      "createdBy",
      (p) =>
        p.createdBy
          ? sanitizeObject(p.createdBy, [
              ["id", (u) => u._id],
              ["name", (u) => u.name],
            ])
          : undefined,
    ],
    ["createdAt", (p) => p.createdAt],
    ["updatedAt", (p) => p.updatedAt],
  ]);

exports.sanitizeTask = (task) =>
  sanitizeObject(task, [
    ["id", (t) => t._id],
    ["title", (t) => t.title],
    ["description", (t) => t.description],
    ["status", (t) => t.status],
    ["priority", (t) => t.priority],
    ["dueDate", (t) => t.dueDate],
    [
      "assignedTo",
      (t) =>
        t.assignedTo
          ? sanitizeObject(t.assignedTo, [
              ["id", (u) => u._id],
              ["name", (u) => u.name],
              ["email", (u) => u.email],
            ])
          : undefined,
    ],
    [
      "project",
      (t) =>
        t.project
          ? sanitizeObject(t.project, [
              ["id", (p) => p._id],
              ["title", (p) => p.title],
            ])
          : undefined,
    ],
    [
      "createdBy",
      (t) =>
        t.createdBy
          ? sanitizeObject(t.createdBy, [
              ["id", (u) => u._id],
              ["name", (u) => u.name],
            ])
          : undefined,
    ],
    ["createdAt", (t) => t.createdAt],
    ["updatedAt", (t) => t.updatedAt],
  ]);
