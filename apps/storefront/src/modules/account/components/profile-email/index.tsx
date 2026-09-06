"use client"

import React, { useActionState, useEffect } from "react"

import Input from "@modules/common/components/input"

import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
import { updateCustomerEmail } from "@lib/data/customer"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

const ProfileEmail: React.FC<MyInformationProps> = ({ customer }) => {
  const [showResult, setShowResult] = React.useState(false)
  const [state, formAction] = useActionState(updateCustomerEmail, {
    error: null as string | null,
    success: false,
  })

  const clearState = () => {
    setShowResult(false)
  }

  useEffect(() => setShowResult(true), [state])

  return (
    <form action={formAction} className="w-full">
      <AccountInfo
        label="Email"
        currentInfo={`${customer.email}`}
        isSuccess={showResult && state.success}
        isError={showResult && !!state.error}
        errorMessage={state.error || undefined}
        clearState={clearState}
        data-testid="account-email-editor"
      >
        <div className="grid grid-cols-1 gap-y-2">
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={customer.email}
            data-testid="email-input"
          />
          <Input
            label="Current password"
            name="current_password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="email-current-password-input"
          />
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfileEmail
