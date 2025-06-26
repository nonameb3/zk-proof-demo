import { buildPoseidon } from "circomlibjs";
import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

interface ProofData {
  data: string;
  hash: string;
  proof: any;
  publicSignals: string[];
}

async function generateProofAndVerify(secretMessage: string): Promise<ProofData> {
  const poseidon = await buildPoseidon();
  
  // Step 1: Generate hash from message
  console.log("Step 1: Generating hash from message...");
  const messageHash = ethers.keccak256(ethers.toUtf8Bytes(secretMessage));
  const numericInput = BigInt(messageHash);
  const hash = poseidon([numericInput]);
  
  const dataStr = numericInput.toString();
  const hashStr = poseidon.F.toString(hash);
  
  console.log(`Message: "${secretMessage}"`);
  console.log("Data (numeric):", dataStr);
  console.log("Hash:", hashStr);
  
  // Step 2: Create input file
  console.log("\nStep 2: Creating circuit input...");
  const input = {
    data: dataStr,
    hash: hashStr
  };
  
  const inputPath = path.join(process.cwd(), "input.json");
  fs.writeFileSync(inputPath, JSON.stringify(input, null, 2));
  console.log("Input file created:", inputPath);
  
  // Step 3: Generate witness
  console.log("\nStep 3: Generating witness...");
  const { execSync } = require('child_process');
  const circuitsDir = path.join(process.cwd(), "circuits");
  
  try {
    execSync(`node ${circuitsDir}/preimage_js/generate_witness.js ${circuitsDir}/preimage_js/preimage.wasm ${inputPath} ${circuitsDir}/witness.wtns`, 
      { stdio: 'inherit' });
    console.log("Witness generated successfully");
  } catch (error) {
    throw new Error(`Failed to generate witness: ${error}`);
  }
  
  // Step 4: Generate proof
  console.log("\nStep 4: Generating zk-SNARK proof...");
  try {
    execSync(`snarkjs groth16 prove ${circuitsDir}/preimage_0001.zkey ${circuitsDir}/witness.wtns ${circuitsDir}/proof.json ${circuitsDir}/public.json`, 
      { stdio: 'inherit' });
    console.log("Proof generated successfully");
  } catch (error) {
    throw new Error(`Failed to generate proof: ${error}`);
  }
  
  // Step 5: Verify proof off-chain
  console.log("\nStep 5: Verifying proof off-chain...");
  try {
    execSync(`snarkjs groth16 verify ${circuitsDir}/vkey.json ${circuitsDir}/public.json ${circuitsDir}/proof.json`, 
      { stdio: 'inherit' });
    console.log("✅ Proof verified successfully off-chain!");
  } catch (error) {
    throw new Error(`Proof verification failed: ${error}`);
  }
  
  // Step 6: Read generated files
  const proof = JSON.parse(fs.readFileSync(path.join(circuitsDir, "proof.json"), "utf8"));
  const publicSignals = JSON.parse(fs.readFileSync(path.join(circuitsDir, "public.json"), "utf8"));
  
  console.log("\n📦 Generated proof data for dApp:");
  console.log("Public signals:", publicSignals);
  
  return {
    data: dataStr,
    hash: hashStr,
    proof,
    publicSignals
  };
}

// Function to format proof for smart contract
export function formatProofForContract(proofData: ProofData) {
  const { proof } = proofData;
  
  return {
    pi_a: [proof.pi_a[0], proof.pi_a[1]],
    pi_b: [
      [proof.pi_b[0][1], proof.pi_b[0][0]],
      [proof.pi_b[1][1], proof.pi_b[1][0]]
    ],
    pi_c: [proof.pi_c[0], proof.pi_c[1]],
    publicSignals: proofData.publicSignals
  };
}

// Main execution
async function main() {
  try {
    const secretMessage = process.argv[2] || "my secret data";
    console.log("🚀 Starting ZK proof generation and verification...\n");
    
    const proofData = await generateProofAndVerify(secretMessage);
    const contractData = formatProofForContract(proofData);
    
    console.log("\n🎯 Contract-ready proof data:");
    console.log(JSON.stringify(contractData, null, 2));
    
    // Save contract-ready data
    const outputPath = path.join(process.cwd(), "proof-data.json");
    fs.writeFileSync(outputPath, JSON.stringify(contractData, null, 2));
    console.log(`\n💾 Contract-ready proof saved to: ${outputPath}`);
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { generateProofAndVerify };