import { Badge, Button } from "@modules/common/components/ui"
import { useEffect } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import { useFormStatus } from "react-dom"

type AccountInfoProps = {
  label: string
  currentInfo: string | React.ReactNode
  isSuccess?: boolean
  isError?: boolean
  errorMessage?: string
  clearState: () => void
  children?: React.ReactNode
  'data-testid'?: string
}

const AccountInfo = ({
  label,
  currentInfo,
  isSuccess,
  isError,
  clearState,
  errorMessage = "An error occurred, please try again",
  children,
  'data-testid': dataTestid
}: AccountInfoProps) => {
  const { state, close, toggle } = useToggleState()

  const { pending } = useFormStatus()

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    clearState()
    toggle()
  }

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  return (
    <div
      className="rounded-[20px] border border-[#E6E8EC] bg-white p-5 text-sm shadow-[0_8px_24px_rgba(32,36,51,0.04)]"
      data-testid={dataTestid}
    >
      <div className="grid gap-4 xsmall:grid-cols-[minmax(0,1fr)_auto] xsmall:items-start">
        <div className="min-w-0">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
            {label}
          </span>
          <div className="mt-2 flex min-w-0 items-center gap-x-4 text-base leading-7 text-ink">
            {typeof currentInfo === "string" ? (
              <span
                className="break-words font-semibold"
                data-testid="current-info"
              >
                {currentInfo || "Not added yet"}
              </span>
            ) : (
              currentInfo
            )}
          </div>
        </div>
        <button
          className="inline-flex min-h-11 w-full items-center justify-center rounded-[14px] border border-[#E6E8EC] bg-white px-5 text-sm font-bold text-ink transition-colors hover:border-brand hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 xsmall:w-[118px]"
          onClick={handleToggle}
          type="button"
          data-testid="edit-button"
          data-active={state}
          aria-expanded={state}
        >
          {state ? "Cancel" : "Edit"}
        </button>
      </div>

      {/* Success state */}
      {isSuccess && (
        <div className="overflow-hidden" data-testid="success-message">
          <Badge className="my-4 bg-mint px-3 py-2 text-ink" color="green">
            <span>{label} updated successfully</span>
          </Badge>
        </div>
      )}

      {/* Error state  */}
      {isError && (
        <div className="overflow-hidden" data-testid="error-message">
          <Badge className="my-4 px-3 py-2" color="red">
            <span>{errorMessage}</span>
          </Badge>
        </div>
      )}

      {state && (
        <div className="overflow-visible" data-testid="edit-panel">
          <div className="mt-5 rounded-[18px] bg-cream p-4">
            <div>{children}</div>
            <div className="mt-4 flex items-center justify-end">
              <Button
                isLoading={pending}
                className="pbn-primary-button w-full border-0 small:max-w-[160px]"
                type="submit"
                data-testid="save-button"
              >
                Save changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountInfo
