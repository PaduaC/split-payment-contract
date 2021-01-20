const SplitPayment = artifacts.require("SplitPayment");

contract("SplitPayment", (accounts) => {
  let splitPayment = null;
  before(async () => {
    splitPayment = await SplitPayment.deployed();
  });

  it("should split payment", async () => {
    const recipients = [accounts[1], accounts[2], accounts[3]];
    const amounts = [20, 30, 40];
    const initialBalances = await Promise.all(
      recipients.map((recipient) => {
        return web3.eth.getBalance(recipient);
      })
    );
    await splitPayment.send(recipients, amounts, {
      from: accounts[0],
      value: 90,
    });
    const finalBalances = await Promise.all(
      recipients.map((recipient) => {
        return web3.eth.getBalance(recipient);
      })
    );
    recipients.forEach((_item, i) => {
      const initialBalance = web3.utils.toBN(initialBalances[i]);
      const finalBalance = web3.utils.toBN(finalBalances[i]);
      assert(finalBalance.sub(initialBalance).toNumber() === amounts[i]);
    });
  });

  it("should not split payment if array lengths mismatch", async () => {
    const recipients = [accounts[1], accounts[2], accounts[3]];
    const amounts = [20, 30];
    try {
      await splitPayment.send(recipients, amounts, {
        from: accounts[0],
        value: 90,
      });
    } catch (err) {
      assert(err.message.includes("both arrays must have the same length"));
      return;
    }
    assert(false);
  });

  it("should not split payment if not owner", async () => {
    const recipients = [accounts[1], accounts[2], accounts[3]];
    const amounts = [20, 30, 40];
    try {
      await splitPayment.send(recipients, amounts, {
        from: accounts[5],
        value: 90,
      });
    } catch (err) {
      assert(
        err.message.includes(
          "VM Exception while processing transaction: revert"
        )
      );
      return;
    }
    assert(false);
  });
});
