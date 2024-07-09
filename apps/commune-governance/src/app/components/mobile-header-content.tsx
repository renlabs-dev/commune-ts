"use client"

import { BalanceSection } from './balance-section'
import { CreateDao } from './create-dao'
import { CreateProposal } from './create-proposal'

import React from 'react'

export const MobileHeaderContent = () => {
  return (
    <>
      <BalanceSection />

      <div className="flex flex-col w-full gap-3 pt-3 text-green-500">
        <CreateDao />
        <CreateProposal />
      </div>
    </>
  )
}