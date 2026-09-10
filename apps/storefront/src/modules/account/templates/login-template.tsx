"use client"

import { useState } from "react"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import ForgotPassword from "@modules/account/components/forgot-password"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
  FORGOT_PASSWORD = "forgot-password",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState<LOGIN_VIEW>(LOGIN_VIEW.SIGN_IN)

  return (
    <div className="grid w-full gap-6 small:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.8fr)] small:items-stretch">
      <div className="rounded-[24px] bg-cream p-6 xsmall:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
          PetBoxNest member care
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-ink xsmall:text-4xl">
          Faster checkout for the homes pets already run.
        </h2>
        <p className="mt-4 text-base leading-7 text-muted">
          Sign in to keep addresses, orders, and profile details ready whenever
          your household needs a refill or a new favorite spot.
        </p>
        <div className="mt-6 grid gap-3 text-sm font-bold text-ink">
          <span className="rounded-[16px] bg-white px-4 py-3">
            Saved shipping addresses
          </span>
          <span className="rounded-[16px] bg-white px-4 py-3">
            Recent order history
          </span>
          <span className="rounded-[16px] bg-white px-4 py-3">
            Profile details in one place
          </span>
        </div>
      </div>
      <div className="flex justify-center rounded-[24px] border border-[#E6E8EC] bg-white p-5 xsmall:p-8">
        {currentView === LOGIN_VIEW.SIGN_IN ? (
          <Login setCurrentView={setCurrentView} />
        ) : currentView === LOGIN_VIEW.FORGOT_PASSWORD ? (
          <ForgotPassword setCurrentView={setCurrentView} />
        ) : (
          <Register setCurrentView={setCurrentView} />
        )}
      </div>
    </div>
  )
}

export default LoginTemplate
