export const getInventoryItemsQuery = `
query inventoryItems {
  inventoryItems(first: 200) {
    edges {
      node {
        id
        sku
        countryCodeOfOrigin
        harmonizedSystemCode
        variant {
          id
          displayName
          barcode
          inventoryQuantity
          title
          product{
            id
            title
            handle
            options{
              name
              values
            }
            hasOutOfStockVariants
            featuredMedia{
              preview{
                image{
                  url
                  width
                  height
                }
              }
            }
          }
        }
        inventoryLevels(first: 100){
          edges{
            node{
              location{
                id
                address {
                  formatted
                }
                name
              }
              quantities(names: ["available", "incoming", "committed", "damaged", "on_hand", "quality_control", "reserved", "safety_stock"]){
                name
                quantity
                id
              }
            }
          }
        }
      }
    }
  }
}
`;
export const getAllLocations = `
query {
  locations(first: 5) {
    edges {
      node {
        id
        name
        address {
          formatted
        }
      }
    }
  }
}`;

// Updating Queries

export const updateProductQuery = `
mutation UpdateProductWithNewMedia($input: ProductInput!, $media: [CreateMediaInput!]) {
  productUpdate(input: $input, media: $media) {
    product {
      id
      title
      handle
    }
    userErrors {
      field
      message
    }
  }
}
`;

export const updateProductVariantQuery = `
mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
  productVariantsBulkUpdate(productId: $productId, variants: $variants) {
    product {
      id
    }
    productVariants {
      barcode
      sku
      inventoryItem {
        harmonizedSystemCode
        countryCodeOfOrigin
        sku
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;

export const updateInventoryQuantitiesQuery = `
mutation InventorySet($input: InventorySetQuantitiesInput!) {
  inventorySetQuantities(input: $input) {
    inventoryAdjustmentGroup {
      reason
      referenceDocumentUri
      changes {
        name
        delta
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;

export const getStoreUrl = `
query ShopMetafield {
  shop{
    url
    name
  }
}
`;
