import { buildPoseidon } from "circomlibjs"
import * as snarkjs from "snarkjs"
import { ethers } from "ethers"
import type { ZKProofInput, ZKProofOutput, ZKVerificationResult, CircuitArtifacts } from "./types"

export class ZKProofGenerator {
  private artifacts: CircuitArtifacts
  private poseidon: any
  private initialized: boolean = false

  constructor(artifacts: CircuitArtifacts) {
    this.artifacts = artifacts
    this.initPoseidon()
  }

  private async initPoseidon() {
    this.poseidon = await buildPoseidon()
    this.initialized = true
  }

  // Generate Poseidon hash using circomlibjs (following genProof.ts approach)
  async generatePoseidonHash(input: string): Promise<string> {
    if (!this.initialized) {
      await this.initPoseidon()
    }
    
    // Use ethers keccak256 approach like in genProof.ts
    const messageHash = ethers.keccak256(ethers.toUtf8Bytes(input))
    const numericInput = BigInt(messageHash)
    const hash = this.poseidon([numericInput])
    
    return this.poseidon.F.toString(hash)
  }

  // Generate ZK proof using your preimage circuit
  async generateProof(input: ZKProofInput): Promise<ZKProofOutput> {
    const hash = await this.generatePoseidonHash(input.secret)
    
    // Use ethers keccak256 approach like in genProof.ts
    const messageHash = ethers.keccak256(ethers.toUtf8Bytes(input.secret))
    const numericInput = BigInt(messageHash)
    
    // Prepare circuit inputs to match your preimage.circom
    // Your circuit expects: data (private), hash (public)  
    const circuitInputs = {
      data: numericInput.toString(),
      hash: hash
    }

    // Generate proof using snarkjs
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      circuitInputs,
      this.artifacts.wasmPath,
      this.artifacts.zkeyPath
    )

    return {
      proof,
      publicSignals: publicSignals.map((signal: any) => signal.toString()),
      hash,
      timestamp: Date.now()
    }
  }

  // Verify ZK proof
  async verifyProof(
    proof: any,
    publicSignals: string[]
  ): Promise<ZKVerificationResult> {
    // Load verification key
    const verificationKey = await fetch(this.artifacts.verificationKeyPath)
      .then(res => res.json())

    // Verify proof using snarkjs
    const isValid = await snarkjs.groth16.verify(
      verificationKey,
      publicSignals,
      proof
    )

    return {
      isValid,
      timestamp: Date.now()
    }
  }
}