import React, { useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import useLiquidity from '@/application/liquidity/useLiquidity'
import Button, { ButtonHandle } from '@/components/Button'
import Card from '@/components/Card'
import Dialog from '@/components/Dialog'
import Icon from '@/components/Icon'
import Row from '@/components/Row'
import useToken from '@/application/token/useToken'
import assert from '@/functions/assert'
import { isValidePublicKey } from '@/functions/judgers/dateType'
import { findTokenMintByAmmId, findTokenMintByMarketId } from '@/application/liquidity/utils/miscToolFns'
import useNotification from '@/application/notification/useNotification'
import InputBox from '../InputBox'

export function SearchAmmDialog({
  open,
  onClose,
  className
}: {
  open: boolean
  onClose: () => void
  className?: string
}) {
  const [searchText, setSearchText] = React.useState('')
  const buttonComponentRef = useRef<ButtonHandle>()

  const parseTokensFromSearchInput = async (currentValue: string) => {
    try {
      const { getToken } = useToken.getState()
      assert(isValidePublicKey(currentValue), 'invalid public key')

      const ammFindResult = findTokenMintByAmmId(currentValue)
      if (ammFindResult) {
        useLiquidity.setState({ coin1: getToken(ammFindResult.base), coin2: getToken(ammFindResult.quote) })
        return
      }

      const marketFindResult = await findTokenMintByMarketId(currentValue)
      if (marketFindResult) {
        useLiquidity.setState({ coin1: getToken(marketFindResult.base), coin2: getToken(marketFindResult.quote) })
        return
      }

      throw new Error(`fail to extract info throungh this AMMId or MarketId`)
    } catch (err) {
      const { logError } = useNotification.getState()
      logError(String(err))
      throw err
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      {({ close: closeDialog }) => (
        <Card
          className={twMerge(
            'shadow-xl backdrop-filter backdrop-blur-xl p-8 rounded-3xl w-[min(456px,90vw)] border-1.5 border-[rgba(171,196,255,0.2)]',
            className
          )}
          size="lg"
          style={{
            background:
              'linear-gradient(140.14deg, #333333 0%, #1d39b9 86.61%), linear-gradient(321.82deg, rgb(24, 19, 77) 0%, rgb(27, 22, 89) 100%)',
            boxShadow: '0px 8px 48px rgba(171, 196, 255, 0.12)'
          }}
        >
          <Row className="justify-between items-center mb-6">
            <div className="text-xl font-semibold text-white">Pool Search</div>
            <Icon className="text-[#ABC4FF] cursor-pointer" heroIconName="x" onClick={closeDialog} />
          </Row>

          <InputBox
            inputStyle="textarea"
            className="mb-6"
            label="AMM ID or Serum market ID"
            onUserInput={setSearchText}
            onEnter={(currentValue) => {
              parseTokensFromSearchInput(currentValue)
                .then(() => closeDialog())
                .catch(() => {})
            }}
          />

          <Row className="flex-col gap-1">
            <Button
              className="frosted-glass frosted-glass-teal"
              componentRef={buttonComponentRef}
              onClick={() => {
                parseTokensFromSearchInput(searchText)
                  .then(() => closeDialog())
                  .catch(() => {})
              }}
            >
              Search
            </Button>
          </Row>
        </Card>
      )}
    </Dialog>
  )
}
