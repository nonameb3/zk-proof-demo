"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Key, Cpu, Copy, CheckCircle, Link } from "lucide-react"
import { Header } from "./header"
import { KeyBenefits } from "./key-benefits"
import { GenerateTab } from "./generate-tab"
import { ShareTab } from "./share-tab"
import { VerifyTab } from "./verify-tab"
import { BlockchainTab } from "./blockchain-tab"
import { useZKProof } from "@/hooks/use-zk-proof"

export default function Component() {
  const [activeTab, setActiveTab] = useState("generate")
  const [secret, setSecret] = useState("")
  
  const {
    isGenerating,
    generationProgress,
    zkProof,
    isVerifying,
    verificationResult,
    copied,
    generatePoseidonHash,
    handleGenerateProof,
    handleVerifyProof,
    copyProof,
    isInitialized,
  } = useZKProof()

  const onGenerateProof = async (secret: string) => {
    const proof = await handleGenerateProof(secret)
    if (proof) {
      setActiveTab("share")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Header />
        <KeyBenefits />

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              ZK-SNARK Proof System
            </CardTitle>
            <CardDescription>Generate cryptographic proofs without revealing sensitive data</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="generate" className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  Generate
                </TabsTrigger>
                <TabsTrigger value="share" disabled={!zkProof} className="flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  Share
                </TabsTrigger>
                <TabsTrigger value="verify" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Verify
                </TabsTrigger>
                <TabsTrigger value="blockchain" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Blockchain
                </TabsTrigger>
              </TabsList>

              <GenerateTab 
                secret={secret}
                setSecret={setSecret}
                isGenerating={isGenerating}
                generationProgress={generationProgress}
                generatePoseidonHash={generatePoseidonHash}
                onGenerateProof={onGenerateProof}
                isInitialized={isInitialized}
              />
              <ShareTab 
                zkProof={zkProof}
                copied={copied}
                onCopyProof={copyProof}
                onSwitchToBlockchain={() => setActiveTab("blockchain")}
              />
              <VerifyTab 
                isVerifying={isVerifying}
                verificationResult={verificationResult}
                onVerifyProof={handleVerifyProof}
              />
              <BlockchainTab 
                currentHash={zkProof?.hash}
              />
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500">
          <p>
            This demonstration showcases advanced cryptography implementation and UX design for complex blockchain
            technology. Built for enterprise-grade privacy-preserving applications.
          </p>
        </div>
      </div>
    </div>
  )
}
