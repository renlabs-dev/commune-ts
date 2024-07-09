"use client"

import { BalanceSection } from './balance-section'
import { CreateDao } from './create-dao'
import { CreateProposal } from './create-proposal'

import React from 'react'

export const MobileHeaderContent = () => {
  return (
    <>
      <div className="flex flex-col w-full text-green-500">
        <BalanceSection />
      </div>

      <div className="flex flex-col w-full p-4 text-green-500 gap-4 border-b border-white/20">
        <CreateDao />
        <CreateProposal />
      </div>
    </>
  )
}