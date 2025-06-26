// ZKP Type definitions for the project

export interface ZKProofInput {
  secret: string;
  expectedHash?: string;
}

export interface ZKProofOutput {
  proof: any;
  publicSignals: string[];
  hash: string;
  timestamp: number;
}

export interface ZKVerificationResult {
  isValid: boolean;
  timestamp: number;
  gasUsed?: number;
  blockNumber?: number;
}

export interface CircuitArtifacts {
  wasmPath: string;
  zkeyPath: string;
  verificationKeyPath: string;
}

export interface ZKProofData {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol: string;
  curve: string;
}
