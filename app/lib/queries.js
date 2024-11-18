export const getInventoryItemsQuery = `
query inventoryItems {
  inventoryItems(first: 100) {
    edges {
      node {
        id
        sku
        variant {
          displayName
          barcode
          inventoryQuantity
        }
        inventoryLevels(first: 100){
          edges{
            node{
              location{
                id
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
