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
          displayName
          barcode
          inventoryQuantity
          title
          product{
            title
            handle
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
