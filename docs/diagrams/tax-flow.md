# Tax Resolution Flow

When calculating the final price for an Item:

1.  **Item Check**: Does `item.tax_applicable` have a value (true/false)?

    - If YES: Use `item.tax_percentage`
    - If NO (null): Proceed to Step 2

2.  **Subcategory Check**: Does the item have a `subcategory_id`?

    - If YES: Does `subcategory.tax_applicable` have a value?
      - If YES: Use `subcategory.tax_percentage`
      - If NO (null): Proceed to Step 3
    - If NO: Proceed to Step 3

3.  **Category Check**: Use `category.tax_percentage` from the parent Category

**Result**: A fallback mechanism that ensures that every item has a tax rate
