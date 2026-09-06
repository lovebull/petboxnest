"use client"

import React, { useActionState, useEffect } from "react"

import Input from "@modules/common/components/input"

import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
import { updateCustomerName } from "@lib/data/customer"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

const ProfileName: React.FC<MyInformationProps> = ({ customer }) => {
  const [successState, setSuccessState] = React.useState(false)
  const [showResult, setShowResult] = React.useState(false)

  const [state, formAction] = useActionState(updateCustomerName, {
    error: null as string | null,
    success: false,
  })

  const clearState = () => {
    setSuccessState(false)
    setShowResult(false)
  }

  useEffect(() => {
    setSuccessState(state.success)
    setShowResult(true)
  }, [state])

  return (
    <form action={formAction} className="w-full overflow-visible">
      <AccountInfo
        label="Name"
        currentInfo={`${customer.first_name} ${customer.last_name}`}
        isSuccess={showResult && successState}
        isError={showResult && !!state.error}
        errorMessage={state.error || undefined}
        clearState={clearState}
        data-testid="account-name-editor"
      >
        <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
          <Input
            label="First name"
            name="first_name"
            required
            maxLength={255}
            autoComplete="given-name"
            defaultValue={customer.first_name ?? ""}
            data-testid="first-name-input"
          />
          <Input
            label="Last name"
            name="last_name"
            required
            maxLength={255}
            autoComplete="family-name"
            defaultValue={customer.last_name ?? ""}
            data-testid="last-name-input"
          />
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfileName
