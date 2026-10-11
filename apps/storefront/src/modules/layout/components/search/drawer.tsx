"use client"

import { Dialog, Transition } from "@headlessui/react"
import { XMark } from "@medusajs/icons"
import { Fragment, type ReactNode } from "react"

const SearchDrawer = ({
  isOpen,
  close,
  children,
}: {
  isOpen: boolean
  close: () => void
  children: ReactNode
}) => (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-[75]" onClose={close}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm" />
      </Transition.Child>

      <div className="fixed inset-0 overflow-hidden">
        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-4 small:pl-10">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel
              className="pointer-events-auto w-screen max-w-md"
              data-testid="search-drawer"
            >
              <div className="flex h-full flex-col border-l border-grey-20 bg-cream shadow-[0_16px_40px_rgba(32,36,51,0.18)]">
                <div className="flex items-center justify-between border-b border-grey-20 bg-white px-5 py-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                      Find their fit
                    </p>
                    <Dialog.Title className="mt-1 font-display text-2xl font-bold text-ink">
                      Search PetBoxNest
                    </Dialog.Title>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close search"
                    className="pbn-focus grid h-11 w-11 place-items-center rounded-[14px] border border-grey-20 bg-cream text-ink hover:border-brand/50"
                    data-testid="close-search-drawer"
                  >
                    <XMark />
                  </button>
                </div>
                {children}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
)

export default SearchDrawer
