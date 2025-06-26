// Circuit compilation and setup utilities

import type { CircuitArtifacts } from "./types"

export class CircuitManager {
  static getDefaultArtifacts(): CircuitArtifacts {
    return {
      wasmPath: "/zkp/preimage.wasm",
      zkeyPath: "/zkp/preimage_0001.zkey", 
      verificationKeyPath: "/zkp/vkey.json"
    }
  }

  static async checkArtifactsExist(artifacts: CircuitArtifacts): Promise<boolean> {
    try {
      const responses = await Promise.all([
        fetch(artifacts.wasmPath),
        fetch(artifacts.zkeyPath),
        fetch(artifacts.verificationKeyPath)
      ])

      return responses.every(response => response.ok)
    } catch {
      return false
    }
  }

  static async initializeCircuit(): Promise<CircuitArtifacts> {
    const artifacts = this.getDefaultArtifacts()
    
    const artifactsExist = await this.checkArtifactsExist(artifacts)
    
    if (!artifactsExist) {
      throw new Error(
        "Circuit artifacts not found. Please compile the circuit first using: cd circuits && ./compile.sh"
      )
    }

    return artifacts
  }
}