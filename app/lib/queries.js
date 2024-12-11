export const getInventoryItemsQuery = `
query inventoryItems {
  inventoryItems(first: 250) {
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

export const getAfterSpecificInventoryItemsQuery = `
query inventoryItems($first: Int!, $after: String, $id: ID!) {
  inventoryItems(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    edges {
      cursor
      node {
        id
        sku
        countryCodeOfOrigin
        harmonizedSystemCode
        variant {
          id
          barcode
          inventoryQuantity
          title
          sku
          product {
            id
            title
            handle
            options {
              name
              values
            }
            featuredMedia {
              preview {
                image {
                  url
                }
              }
            }
          }
        }
        inventoryLevel(locationId: $id) {
          location {
            id
            address {
              formatted
            }
            name
          }
          quantities(
            names: ["available", "incoming", "committed", "damaged", "on_hand", "quality_control", "reserved", "safety_stock"]
          ) {
            name
            quantity
            id
          }
        }
      }
    }
  }
}

`;

export const getBeforeSpecificInventoryItemsQuery = `
query inventoryItems($last: Int!, $before: String, $id: ID!) {
  inventoryItems(last: $last, before: $before) {
    pageInfo {
      hasNextPage
      hasPreviousPage
      endCursor
      startCursor
    }
    edges {
      cursor
      node {
        id
        sku
        countryCodeOfOrigin
        harmonizedSystemCode
        variant {
          id
          barcode
          inventoryQuantity
          title
          sku
          product {
            id
            title
            handle
            options {
              name
              values
            }
            hasOutOfStockVariants
            featuredMedia {
              preview {
                image {
                  url
                }
              }
            }
          }
        }
        inventoryLevel(locationId: $id) {
          location {
            name
            address {
              formatted
            }
          }
          quantities(
            names: [
              "available",
              "incoming",
              "committed",
              "damaged",
              "on_hand",
              "quality_control",
              "reserved",
              "safety_stock"
            ]
          ) {
            name
            quantity
            id
          }
        }
      }
    }
  }
}

`;
export const bulkRunQuery = `
"""
{
  inventoryItems(first: 10) {
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
    """`;

export const runBulkQueryOperation = `
mutation bulkOperationRunQuery {
  bulkOperationRunQuery(
    query: ${bulkRunQuery}
  ) {
    bulkOperation {
      id
      status
      url
    }
    userErrors {
      field
      message
    }
  }
}
`;

export const bulkOperationResponseQuery = `
query BulkOperationQueryUrl {
  currentBulkOperation(type: QUERY) {
    id
    type
    status
    fileSize
    url
  }
}`;
