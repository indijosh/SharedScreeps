module.exports = {
  runMarketAnalysis: function() {
    // find the terminal
    const terminal = Game.getObjectById('596dd41eb414f846f597dc27');

    // make sure the terminal has something to sell
    if (terminal.store[RESOURCE_OXYGEN] > 2000) {
      // set up constant variables
      const amountToSell = 2000,
        maxTransferEnergyCost = terminal.store[RESOURCE_ENERGY],
        minCostOfOxygen = .3;

      // get all the orders for oxygen
      const orders = Game.market.getAllOrders({
        type: ORDER_BUY,
        resourceType: RESOURCE_OXYGEN
      });

      /// get the highest price of all the orders
      var highestPrice = _.max(orders, function(o) { return o.price; });

      // make sure the highestPrice is still above what we want to get paid
      if(highestPrice.price > minCostOfOxygen){

        // get the transfer energy cost to make sure we can afford the transfer
        const transferEnergyCost = Game.market.calcTransactionCost(amountToSell, 'E61S92', highestPrice.roomName);
        if(transferEnergyCost < maxTransferEnergyCost)
        {
          // if they are requesting more than we have
          if(highestPrice.remainingAmount > amountToSell){
            // give them what we have
            Game.market.deal(highestPrice.id, amountToSell, "E61S92");
          }
          // otherwise give them what they're requesting
          else {
            Game.market.deal(highestPrice.id, highestPrice.remainingAmount, "E61S92");
          }
        }
      }
    }
  }
};
