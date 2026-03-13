import * as anchor from "@coral-xyz/anchor";

module.exports = async function deploy(provider: anchor.AnchorProvider) {
  anchor.setProvider(provider);
  console.log("Ozlax deploy migration completed.");
};
