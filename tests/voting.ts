import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from '@solana/web3.js';
import { BN } from "bn.js";

import { Voting } from "../target/types/voting";
import { expect } from "chai";

describe("voting", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const votingProgram = anchor.workspace.Voting as Program<Voting>;

  it("Initialize poll!", async () => {
    const date = new Date(Date.UTC(2028, 11, 24, 15, 0, 0));
    const pollEndTimestamp = new BN(Math.floor(date.getTime() / 1000));

    const tx = await votingProgram.methods.initializePoll(new BN(1),
      "What is your favorite type of peanut butter?",
      new BN(0),
      pollEndTimestamp).rpc();
    console.log("Your transaction signature", tx);

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [
        new BN(1).toBuffer("le", 8)
      ],
      votingProgram.programId
    );

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    console.log(">>> poll >>>", poll);

    expect(poll.description).to.equal("What is your favorite type of peanut butter?");
    expect(poll.pollId.toNumber()).to.equal(1);
    expect(poll.pollStart.toNumber()).to.be.lessThan(poll.pollEnd.toNumber());
  });
});
