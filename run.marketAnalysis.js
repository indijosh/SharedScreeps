StructureTerminal.prototype.runMarketAnalysis =
  function() {
    // find the terminal (Change to run script from terminal later)
    const lookingToBuyHydrogen = false,
      lookingToSellEnergy = true,
      hydrogenToKeep = 5000,
      room = this.room.name;

    // check if terminal has hydrogen to sell
    if (this.store[RESOURCE_HYDROGEN] > hydrogenToKeep) {
      // set up constant variables
      const amountToSell = this.store[RESOURCE_HYDROGEN] - hydrogenToKeep,
        maxTransferEnergyCost = this.store[RESOURCE_ENERGY],
        minCostOfHydrogen = 1;

      // get all the orders for hydrogen
      const orders = Game.market.getAllOrders({
        type: ORDER_BUY,
        resourceType: RESOURCE_HYDROGEN
      });

      /// get the highest offering price of all the orders
      var highestPrice = _.max(orders, function(o) {
        return o.price;
      });

      // make sure the highestPrice is still above what we want to get paid
      if (highestPrice.price >= minCostOfHydrogen) {
        // get the transfer energy cost to make sure we can afford the transfer
        const transferEnergyCost = Game.market.calcTransactionCost(amountToSell, room, highestPrice.roomName);
        if (transferEnergyCost < maxTransferEnergyCost) {
          // if they are requesting more than we have
          if (highestPrice.remainingAmount > amountToSell) {

            // give them what we have
            Game.market.deal(highestPrice.id, amountToSell, room);
          }
          // otherwise give them what they're requesting
          else {
            Game.market.deal(highestPrice.id, highestPrice.remainingAmount, room);
          }
        }
      }
    }

    if (lookingToBuyHydrogen) {
      // look for really cheap hydrogen
      if (this.store[RESOURCE_HYDROGEN] < 10000) {
        // set up constant variables
        const amountToBuy = 10000 - this.store[RESOURCE_HYDROGEN],
          maxTransferEnergyCost = this.store[RESOURCE_ENERGY],
          maxCostOfHydrogen = .801;

        // get all the orders for hydrogen
        const orders = Game.market.getAllOrders({
          type: ORDER_SELL,
          resourceType: RESOURCE_HYDROGEN
        });

        /// get the lowest selling price of all the orders
        var lowestPrice = _.min(orders, function(o) {
          return o.price;
        });

        // make sure the price is still below the max of what we want to pay
        if (lowestPrice.price < maxCostOfHydrogen) {
          // get the transfer energy cost to make sure we can afford the transfer
          const transferEnergyCost = Game.market.calcTransactionCost(amountToBuy, room, lowestPrice.roomName);
          if (transferEnergyCost < maxTransferEnergyCost) {
            // if they have more than we can want to buy
            if (lowestPrice.remainingAmount > amountToBuy) {
              // give them what we have
              Game.market.deal(lowestPrice.id, amountToBuy, room);
            }
            // otherwise buy what they have
            else {
              Game.market.deal(lowestPrice.id, lowestPrice.remainingAmount, room);
            }
          }
        }
      }
    }

    if (lookingToSellEnergy) {
      //check if terminal has energy to sell
      if (this.store[RESOURCE_ENERGY] > 10000) {
        const amountToSell = this.store[RESOURCE_ENERGY] - 10000,
          maxTransferEnergyCost = 10000,
          minCostOfEnergy = .012;

        // get all the orders for energy
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
          const transferEnergyCost = Game.market.calcTransactionCost(amountToSell, 'E16S17', highestPrice.roomName);
          var energyToSell = this.store[RESOURCE_ENERGY] - transferEnergyCost - 10000;
          // if they are requesting more than we can send
          if (highestPrice.remainingAmount > energyToSell) {
            // give them what we have
            Game.market.deal(highestPrice.id, energyToSell, "E16S17");
          }
          // otherwise give them what they're requesting
          else {
            Game.market.deal(highestPrice.id, highestPrice.remainingAmount, "E16S17");
          }
        }
      }
    }
};
