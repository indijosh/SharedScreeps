module.exports = {
  runMarketAnalysis: function() {
    // find the terminal
    const terminal = Game.getObjectById('59742f0dd4f08c266c4773cf');

    // check if terminal has oxygen to sell
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
      var highestPrice = _.max(orders, function(o) {
        return o.price;
      });

      // make sure the highestPrice is still above what we want to get paid
      if (highestPrice.price > minCostOfOxygen) {
        // get the transfer energy cost to make sure we can afford the transfer
        const transferEnergyCost = Game.market.calcTransactionCost(amountToSell, 'E61S92', highestPrice.roomName);
        if (transferEnergyCost < maxTransferEnergyCost) {
          // if they are requesting more than we have
          if (highestPrice.remainingAmount > amountToSell) {
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

    // look for really cheap oxygen
    if (terminal.store[RESOURCE_OXYGEN] < 10000) {
      // set up constant variables
      const amountToBuy = 10000 - terminal.store[RESOURCE_OXYGEN],
        maxTransferEnergyCost = terminal.store[RESOURCE_ENERGY],
        maxCostOfOxygen = .21;

      // get all the orders for oxygen
      const orders = Game.market.getAllOrders({
        type: ORDER_SELL,
        resourceType: RESOURCE_OXYGEN
      });

      /// get the highest price of all the orders
      var lowestPrice = _.min(orders, function(o) {
        return o.price;
      });

      // make sure the price is still below the max of what we want to pay
      if (lowestPrice.price < maxCostOfOxygen) {
        // get the transfer energy cost to make sure we can afford the transfer
        const transferEnergyCost = Game.market.calcTransactionCost(amountToBuy, 'E61S92', lowestPrice.roomName);
        if (transferEnergyCost < maxTransferEnergyCost) {
          // if they have more than we can want to buy
          if (lowestPrice.remainingAmount > amountToBuy) {
            // give them what we have
            Game.market.deal(lowestPrice.id, amountToBuy, "E61S92");
          }
          // otherwise buy what they have
          else {
            Game.market.deal(lowestPrice.id, lowestPrice.remainingAmount, "E61S92");
          }
        }
      }
    }

    //check if terminal has energy to sell
    if (terminal.store[RESOURCE_ENERGY] > 10000) {
      const amountToSell = terminal.store[RESOURCE_ENERGY] - 10000,
        maxTransferEnergyCost = 10000,
        minCostOfEnergy = .013;

      // get all the orders for oxygen
      const orders = Game.market.getAllOrders({
        type: ORDER_BUY,
        resourceType: RESOURCE_ENERGY
      });

      /// get the highest price of all the orders
      var highestPrice = _.max(orders, function(o) {
        return o.price;
      });

      // make sure the highestPrice is still above what we want to get paid
      if (highestPrice.price >= minCostOfEnergy) {

        // get the transfer energy cost to make sure we can afford the transfer
        const transferEnergyCost = Game.market.calcTransactionCost(amountToSell, 'E61S92', highestPrice.roomName);
        if (transferEnergyCost < maxTransferEnergyCost) {
          // if they are requesting more than we have
          if (highestPrice.remainingAmount > amountToSell) {
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
