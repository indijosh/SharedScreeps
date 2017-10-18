StructureTerminal.prototype.runMarketAnalysis =
  function() {
    // find the terminal (Change to run script from terminal later)
    const lookingToBuyHydrogen = false,
      lookingToSellEnergy = false,
      mineralsToKeep = 5000,
      room = this.room.name;

    // select all the keys except for energy
    var storedMinerals = _.keys(_.omit(this.store, 'energy'));

    for (var i in storedMinerals) {
      // get the mineral type of the current iteration
      var iteratedMineralType = storedMinerals[i];
      // check if terminal has minerals to sell
      if (this.store[iteratedMineralType] != undefined && this.store[iteratedMineralType] > mineralsToKeep) {
        // set up constant variables
        const amountToSell = this.store[iteratedMineralType] - mineralsToKeep,
          maxTransferEnergyCost = this.store[RESOURCE_ENERGY];

        // declare mineralCost variable
        var mineralCost;

        // find the mineral cost from memory
        for (var mineralType in Memory.minCostOfMinerals){
          if(mineralType == iteratedMineralType){
            mineralCost = Memory.minCostOfMinerals[mineralType];
          }
        }

        // get all the orders for the mineral
        const orders = Game.market.getAllOrders({
          type: ORDER_BUY,
          resourceType: iteratedMineralType
        });

        /// get the highest offering price of all the orders
        var highestPrice = _.max(orders, function(o) {
          if(o.amount > 1){
            return o.price;
          }
        });

        // make sure the highestPrice is still above what we want to get paid
        if (highestPrice.price >= mineralCost) {
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
          minCostOfEnergy = .03;
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
          const transferEnergyCost = Game.market.calcTransactionCost(amountToSell, this.room.name, highestPrice.roomName);
          var energyToSell = this.store[RESOURCE_ENERGY] - transferEnergyCost - 10000;
          // if they are requesting more than we can send
          if (highestPrice.remainingAmount > energyToSell) {
            // give them what we have
            Game.market.deal(highestPrice.id, energyToSell, this.room.name);
          }
          // otherwise give them what they're requesting
          else {
            Game.market.deal(highestPrice.id, highestPrice.remainingAmount, this.room.name);
          }
        }
      }
    }
};
