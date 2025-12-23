const CONFIG = {
  brand: "SAPURA CLOUD",

  panel: {
    domain: "https://panel.domainlu.com",
    nestId: 1,
    eggId: 5,
    locationId: 1
  },

  payment: {
    qrisEndpoint: "/api/payment/create",
    checkEndpoint: "/api/payment/check",
    expiredMinutes: 5
  },

  provisioning: {
    createEndpoint: "/api/pterodactyl/create"
  },

  packages: [
    { id: "1gb", name: "Panel 1GB", ram: 1024, cpu: 50, disk: 1024, price: 5000 },
    { id: "2gb", name: "Panel 2GB", ram: 2048, cpu: 70, disk: 2048, price: 9000 },
    { id: "4gb", name: "Panel 4GB", ram: 4096, cpu: 100, disk: 4096, price: 15000 },
    { id: "unli", name: "Unlimited Panel", ram: 0, cpu: 0, disk: 0, price: 30000 }
  ]
};