import React, { ReactNode, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useRouter } from 'next/router'

import BN from 'bn.js'

import useConnection from '@/application/connection/useConnection'
import { HydratedIdoInfo, TicketInfo } from '@/application/ido/type'
import useIdo from '@/application/ido/useIdo'
import useWallet from '@/application/wallet/useWallet'
import AlertText from '@/components/AlertText'
import Button from '@/components/Button'
import CoinAvatar from '@/components/CoinAvatar'
import CountDownClock from '@/components/CountDownClock'
import DecimalInput from '@/components/DecimalInput'
import DropZoneBadgeStatusTag from '@/components/DropZoneBadgeStatusTag'
import Icon from '@/components/Icon'
import Link from '@/components/Link'
import LoadingCircle from '@/components/LoadingCircle'
import PageLayout from '@/components/PageLayout'
import Progress from '@/components/Progress'
import RefreshCircle from '@/components/RefreshCircle'
import Row from '@/components/Row'
import TabWithPanel from '@/components/TabWithPanel'
import { toUTC } from '@/functions/date/dateFormat'
import { currentIsAfter, currentIsBefore } from '@/functions/date/judges'
import formatNumber from '@/functions/format/formatNumber'
import toPercentNumber from '@/functions/format/toPercentNumber'
import { toTokenAmount } from '@/functions/format/toTokenAmount'
import { greaterThanOrEqual, lessThanOrEqual, multiply, toStringNumber } from '@/functions/numberish/stringNumber'
import createContextStore from '@/functions/react/createContextStore'
import { HexAddress } from '@/types/constants'
import { toString } from '@/functions/numberish/toString'

const { ContextProvider: PageRegistor, useStore: usePageData } = createContextStore({
  /** info for ido object item */
  idoInfo: undefined as HydratedIdoInfo | undefined,
  refreshSelf: (() => {}) as () => void,

  /** ticketAmout user want to deposit */
  ticketAmount: undefined as BN | undefined,

  /** action status (haven't realize it yet) */
  isDepositing: false,
  depositingHasSuccess: false,
  isClaimingBase: false,
  claimingBaseHasSuccess: false,
  isClaimingQuote: false,
  claimingQuoteHasSuccess: false
})

export default function _IdoIdPage() {
  return (
    <PageRegistor>
      <IdoIdPage />
    </PageRegistor>
  )
}

function IdoIdPage() {
  const { query } = useRouter()
  const idoId = query.idoid as HexAddress
  // there is a little bit tedious when use both recoil and
  const { setIdoInfo, idoInfo } = usePageData()
  const { idoHydratedInfos: idoHydratedInfoLists } = useIdo()

  useEffect(() => {
    if (idoHydratedInfoLists) setIdoInfo(idoHydratedInfoLists.find((i) => i.id === idoId))
  }, [idoId, idoHydratedInfoLists, setIdoInfo])

  return (
    <PageLayout className="NTF acceleraytor" metaTitle="Acceleraytor" showWalletWidget>
      {idoInfo ? (
        <div className="acceleraytor-id-panel mx-auto px-3 max-w-[84rem] py-8 mobile:py-12">
          <div className="cyberpunk-hero-bg-gradient">
            <Row className="top-box mobile:flex-col my-6 ">
              <TopInfoPanel className="w-2/3 mobile:w-full pc:rounded-tl-3xl pc:rounded-bl-3xl mobile:rounded-tl-2xl mobile:rounded-tr-2xl" />
              <FormPanel className="w-1/3 mobile:w-full pc:rounded-tr-3xl pc:rounded-br-3xl mobile:rounded-bl-3xl mobile:rounded-br-3xl" />
            </Row>
          </div>

          <TicketPanel className="pt-10" />

          <div className="detail-box pt-16 mx-16 mobile:mx-0">
            <Row className="detail-box grid grid-cols-auto-fit mobile:grid-flow-row mobile:grid-cols-none gap-8">
              <ProjectDetailsPanel />
              <BottomInfoPanel />
            </Row>
          </div>
        </div>
      ) : (
        <LoadingCircle className="place-self-center" />
      )}
    </PageLayout>
  )
}

function TopInfoPanel({ className }: { className?: string }) {
  return (
    <Row
      type="grid"
      className={`bg-acceleraytor-card-bg py-8 px-12 mobile:p-4 divide-y-2 divide-blue-300 divide-opacity-10 ${
        className ?? ''
      }`}
    >
      <TopInfoPanelTitlePart className="py-6" />
      <TopInfoPanelDetailPart className="py-6" />
      <TopInfoPanelTicketPart className="py-6" />
    </Row>
  )
}

function TopInfoPanelFieldItem({ fieldName, fieldValue }: { fieldName?: ReactNode; fieldValue?: ReactNode }) {
  return (
    <div className="top-info-panel-field-item">
      <div className="field-name font-semibold text-lg mobile:text-base">{fieldValue}</div>
      <div className="field-value opacity-80 text-xs ">{fieldName}</div>
    </div>
  )
}

function TopInfoPanelTitlePart({ className }: { className?: string }) {
  const { idoInfo } = usePageData()
  return (
    <Row className={`top-info-panel-title-part ${className ?? ''} justify-between items-center`}>
      {idoInfo && (
        <>
          <Row className="items-center space-x-2">
            {idoInfo.base && <CoinAvatar size="lg" iconSrc={idoInfo.base.iconSrc} />}
            <div className="text-2xl font-bold mobile:text-lg">{idoInfo.base?.symbol}</div>
          </Row>
          <Row className="space-x-4 mobile:space-x-2">
            <DropZoneBadgeStatusTag tag={idoInfo.status} />
          </Row>
        </>
      )}
    </Row>
  )
}

function TopInfoPanelDetailPart({ className }: { className?: string }) {
  const { idoInfo } = usePageData()
  return (
    <div className="top-info-panel-detail-part">
      {idoInfo && (
        <>
          <Row
            className={`flex flex-wrap gap-2 top-info-panel-detail-part-info-items justify-between ${className ?? ''}`}
          >
            <TopInfoPanelFieldItem
              fieldName="Total Drop Boxes"
              fieldValue={`${formatNumber(idoInfo.raise)} ${idoInfo.base?.symbol ?? ''}`}
            />
            <TopInfoPanelFieldItem
              fieldName="Per Drop Box"
              fieldValue={`${formatNumber(idoInfo.price)} ${idoInfo.quote?.symbol ?? ''}`}
            />
            {/* TODO */}
            <TopInfoPanelFieldItem
              fieldName="Allocation Per Winning Ticket"
              fieldValue={`1 ${idoInfo.base?.symbol ?? ''}`}
            />
            <TopInfoPanelFieldItem
              fieldName="Total Tickets Deposited"
              fieldValue={`${formatNumber(idoInfo.state.raisedLotteries)} Tickets`}
            />
          </Row>
          <Progress className="my-3" showLabel value={toPercentNumber(idoInfo.filled)} />
        </>
      )}
    </div>
  )
}

function TopInfoPanelTicketPart({ className }: { className?: string }) {
  const { idoInfo } = usePageData()
  return (
    <Row className={`flex flex-wrap gap-2 top-info-panel-ticket-part justify-between ${className ?? ''}`}>
      {idoInfo && (
        <>
          <TopInfoPanelFieldItem
            fieldName="Your Eligible Tickets"
            fieldValue={`${formatNumber(idoInfo.userEligibleTicketAmount)} Ticket(s)`}
          />
          <TopInfoPanelFieldItem
            fieldName="Your Deposited Tickets"
            fieldValue={`${formatNumber(idoInfo.ledger?.depositedTickets?.length ?? 0)} Ticket(s)`}
          />
          <TopInfoPanelFieldItem
            fieldName="Your Winning Tickets"
            fieldValue={`${formatNumber(idoInfo.ledger?.winningTickets?.length ?? 0)} Ticket(s)`}
          />
          {/* <TopInfoPanelFieldItem
            fieldName="Your allocation"
            fieldValue={`${formatNumber(idoInfo.ledger?.userAllocation)} ${idoInfo.base?.symbol ?? ''}`}
          /> */}
        </>
      )}
    </Row>
  )
}

// to manage different period of lottery activity
function FormPanel({ className }: { className?: string }) {
  const { idoInfo, refreshSelf } = usePageData()
  return (
    <Row className={`flex-col bg-ground-color-light py-1 px-8 mobile:px-6 min-w-[300px] ${className ?? ''}`}>
      <Row className="items-center gap-2">
        <div className="title my-4 text-lg font-bold h-max">
          {idoInfo?.status === 'closed' ? 'Deposits Have Closed' : 'Join Lottery'}
        </div>
        <RefreshCircle refreshKey="acceleRaytor/[idoid]" freshFunction={refreshSelf} />
      </Row>
      <div className="py-4">
        {idoInfo?.status === 'upcoming' && <FormPanelLotteryUpcoming />}
        {idoInfo?.status === 'open' && <FormPanelLotteryInput />}
        {idoInfo?.status === 'closed' && <FormPanelClaimButtons />}
      </div>
    </Row>
  )
}

function IdoAlertText({ flag, className }: { flag: '1' | '2' | '3' | '4'; className?: string }) {
  const { idoInfo } = usePageData()

  if (idoInfo && flag === '1') {
    return (
      <AlertText className={className}>
        Eligible tickets will be visible closer to pool open on {toUTC(idoInfo.state.startTime.toNumber())}
      </AlertText>
    )
  }
  if (idoInfo && flag === '2') {
    return (
      <AlertText className={className}>
        Deposited {idoInfo.quote?.symbol ?? ''} can be claimed after the lottery ends. Drop Box can be claimed after{' '}
        {toUTC(idoInfo.state.startWithdrawTime.toNumber())}
      </AlertText>
    )
  }
  if (idoInfo && flag === '3') {
    return (
      <AlertText className={className}>
        Drop Boxes MUST be redeemed on{' '}
        <a href={idoInfo.project.projectWebsiteLink} rel="nofollow noopener noreferrer" target="_blank">
          {idoInfo.project.projectName}
        </a>{' '}
        by
      </AlertText>
    )
  }
  if (idoInfo && flag === '4') {
    return (
      <AlertText className={className}>
        User can only deposit once, and cannot add tickets or deposit a second time
      </AlertText>
    )
  }
  return null
}

function FormPanelLotteryUpcoming() {
  const { idoInfo, refreshSelf } = usePageData()
  return (
    <>
      <Row className="flex-1 grid place-items-center">
        <div className="text-2xl mobile:text-lg opacity-60">Upcoming DropZone Launch</div>
        <Row className="flex-col items-center py-4">
          <div className="justify-self-start opacity-80 mb-2">Deposits will open in:</div>
          <CountDownClock endTime={idoInfo?.state.startTime.toNumber()} onEnd={refreshSelf} />
        </Row>
      </Row>
      <IdoAlertText flag="1" className="pt-4 pb-2 border-t-2 border-white border-opacity-10" />
      <IdoAlertText flag="2" className="pt-2 pb-4" />
    </>
  )
}

function FormPanelLotteryInput({ className }: { className?: string }) {
  const [userBalance, setUserBalance] = useState<string | undefined>()
  const {
    idoInfo,
    refreshSelf,
    ticketAmount,
    isDepositing,
    depositingHasSuccess,
    setTicketAmount,
    setIsDepositing,
    setDepositingHasSuccess
  } = usePageData()
  const { connected, adapter, balances } = useWallet()
  const { connection } = useConnection()
  const { purchase } = useIdo()

  const inputMaxEligibleTickets = () => {
    if (idoInfo && idoInfo.state) {
      setTicketAmount(idoInfo.userEligibleTicketAmount)
    }
  }

  const inputMinEligibleTickets = () => {
    if (idoInfo && idoInfo.state) {
      setTicketAmount(BN.min(idoInfo.state.perUserMinLotteries, idoInfo.userEligibleTicketAmount))
    }
  }

  const clickPurchase = async () => {
    if (!idoInfo || !ticketAmount) return
    try {
      setIsDepositing(true)
      await purchase({
        idoInfo,
        amount: ticketAmount,
        onTxSuccess: () => {
          setIsDepositing(false)
          setDepositingHasSuccess(true)
          refreshSelf()
        },
        onTxError: () => {
          setIsDepositing(false)
        }
      })
      // eslint-disable-next-line no-empty
    } catch (err) {}
  }

  useEffect(() => {
    const userBalance =
      connection && adapter?.publicKey && idoInfo?.quote?.mint ? balances[String(idoInfo?.quote?.mint)] : undefined

    if (userBalance === undefined) setUserBalance(undefined)
    else setUserBalance(userBalance.toFixed())
  }, [connected, adapter, idoInfo?.quote?.mint])

  return (
    <div className={`lottery-input space-y-4 ${className ?? ''}`}>
      {idoInfo && (
        <>
          <div className="text-center">
            Deposits close in:{' '}
            <CountDownClock
              type="text"
              showDays="auto"
              showHours="auto"
              endTime={idoInfo.state.endTime.toNumber()}
              onEnd={refreshSelf}
            />
          </div>
          <IdoAlertText flag="4" />
          <div className="px-4 space-y-3">
            <FormPanelLotteryInputTemplate
              className="border-2 border-white rounded-md p-3"
              topRight={`Eligible Ticket(s): ${connection ? idoInfo.userEligibleTicketAmount : '--'}`}
              bottomLeft={
                <DecimalInput
                  placeholder="(ticket amount)"
                  value={String(ticketAmount)}
                  onUserInput={(v) => setTicketAmount(new BN(toStringNumber(v)))}
                />
              }
              bottomRight={
                <Row className="grid grid-flow-col gap-3">
                  <Button
                    className="py-1 px-3 rounded-md font-bold bg-[#293062] bg-opacity-80 text-sm"
                    onClick={inputMinEligibleTickets}
                  >
                    MIN
                  </Button>
                  <Button
                    className="py-1 px-3 rounded-md font-bold bg-[#293062] bg-opacity-80 text-sm"
                    onClick={inputMaxEligibleTickets}
                  >
                    MAX
                  </Button>
                </Row>
              }
            />
            <FormPanelLotteryInputTemplate
              className="border-2  border-white border-opacity-40 rounded-md p-3 cursor-not-allowed"
              topLeft="Deposit"
              topRight={
                <div className="grid justify-items-end">
                  <span>Balance: </span>
                  <span>{userBalance ?? '--'}</span>
                </div>
              }
              bottomLeft={
                <DecimalInput
                  disabled
                  value={
                    idoInfo.quote &&
                    multiply(
                      ticketAmount ?? 0,
                      toString(toTokenAmount(idoInfo.quote, idoInfo.state.perLotteryQuoteAmount))
                    )
                  }
                />
              }
              bottomRight={
                <Row className="space-x-2">
                  {idoInfo.quote && <Icon iconSrc={idoInfo.quote.iconSrc} />}
                  <div className="text-lg font-bold">{idoInfo.quote?.symbol ?? ''}</div>
                </Row>
              }
            />
            {!connected ? (
              <Button className="block w-full" onClick={() => {}}>
                Connect Wallet
              </Button>
            ) : !idoInfo?.isEligible ? (
              <Button className="block w-full" disabled>
                Wallet not eligible for this pool
              </Button>
            ) : (
              <Button
                className="block w-full"
                validators={[
                  {
                    should: !depositingHasSuccess,
                    fallbackProps: { children: 'Joined' }
                  },
                  {
                    should: (idoInfo.ledger?.depositedTickets?.length ?? 0) === 0,
                    fallbackProps: { children: 'You have already deposited' }
                  },
                  {
                    should: Number(ticketAmount?.toNumber()),
                    fallbackProps: { children: 'Enter ticket amount' }
                  },
                  {
                    should: idoInfo.userEligibleTicketAmount.toNumber() !== 0,
                    fallbackProps: { children: 'No eligible tickets' }
                  },
                  {
                    should: ticketAmount && greaterThanOrEqual(ticketAmount, idoInfo.state.perUserMinLotteries),
                    fallbackProps: { children: `Min. tickets amount is ${idoInfo.state.perUserMinLotteries}` }
                  },
                  {
                    should: ticketAmount && lessThanOrEqual(ticketAmount, idoInfo.userEligibleTicketAmount),
                    fallbackProps: { children: `Max. tickets amount is ${idoInfo.userEligibleTicketAmount}` }
                  }
                ]}
                onClick={clickPurchase}
                isLoading={isDepositing}
              >
                Join Lottery
              </Button>
            )}
          </div>
          <IdoAlertText flag="2" className="pt-1 pb-3" />
        </>
      )}
    </div>
  )
}

function FormPanelLotteryInputTemplate({
  className,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight
}: {
  className?: string
  topLeft?: ReactNode
  topRight?: ReactNode
  bottomLeft?: ReactNode
  bottomRight?: ReactNode
}) {
  return (
    <div className={`grid gap-1 grid-cols-2 ${className ?? ''}`}>
      <div className="top-left opacity-50 text-xs">{topLeft}</div>
      <div className="top-right opacity-50 text-xs justify-self-end">{topRight}</div>
      <div className="bottom-left">{bottomLeft}</div>
      <div className="bottom-right justify-self-end">{bottomRight}</div>
    </div>
  )
}

function FormPanelClaimButtons({ className }: { className?: string }) {
  const {
    idoInfo,
    refreshSelf,
    setIsClaimingBase,
    setClaimingBaseHasSuccess,
    setIsClaimingQuote,
    setClaimingQuoteHasSuccess
  } = usePageData()
  const { claim } = useIdo()
  const { connected } = useWallet()
  const userHasDepositedUSDC = idoInfo && idoInfo.ledger && idoInfo.ledger.quoteDeposited.toNumber() > 0

  if (!idoInfo) return null

  const clickClaim = async (side: 'base' | 'quote') => {
    if (!idoInfo) return
    try {
      ;(side === 'base' ? setIsClaimingBase : setIsClaimingQuote)(true)
      claim({
        side,
        idoInfo,
        onTxSuccess: () => {
          ;(side === 'base' ? setClaimingBaseHasSuccess : setClaimingQuoteHasSuccess)(true)
          refreshSelf()
        }
      })
      // eslint-disable-next-line no-empty
    } catch (err) {
    } finally {
      ;(side === 'base' ? setIsClaimingBase : setIsClaimingQuote)(false)
    }
  }

  return (
    <>
      <div className="my-6">
        {!connected ? (
          <Button className="block w-full" onClick={() => {}}>
            Connect Wallet
          </Button>
        ) : !idoInfo.isEligible ? (
          <Button className="block w-full" disabled>
            Wallet not eligible for this pool
          </Button>
        ) : (
          <Row className={`space-x-6 justify-center ${className}`}>
            {userHasDepositedUSDC ? (
              <>
                <Button
                  className="flex-1"
                  validators={[
                    {
                      should:
                        Number(idoInfo.ledger?.winningTickets?.length ?? 0) !==
                        Number(idoInfo.ledger?.depositedTickets?.length ?? 0)
                    },
                    {
                      should: Number(idoInfo.ledger?.quoteWithdrawn ?? 0) <= 0
                    }
                  ]}
                  onClick={() => {
                    clickClaim('quote')
                  }}
                >
                  Claim {idoInfo.quote?.symbol ?? ''}
                </Button>
                <Button
                  className="flex-1"
                  validators={[
                    { should: currentIsAfter(idoInfo.state.startWithdrawTime.toNumber()) },
                    { should: idoInfo.ledger?.winningTickets && idoInfo.ledger?.winningTickets.length > 0 },
                    { should: idoInfo.ledger && idoInfo.ledger.baseWithdrawn.toNumber() <= 0 }
                  ]}
                  onClick={() => {
                    clickClaim('base')
                  }}
                >
                  Claim {idoInfo.base?.symbol ?? ''}
                </Button>
              </>
            ) : (
              <div className="text-xl opacity-50 ">You did not deposit</div>
            )}
          </Row>
        )}
        {currentIsBefore(idoInfo.state.startWithdrawTime.toNumber()) && userHasDepositedUSDC && (
          <Row className="flex-col items-center py-4">
            <div className="justify-self-start opacity-80 mb-2">Claim Drop Box in:</div>
            <CountDownClock
              showDays="auto"
              showHours="auto"
              endTime={idoInfo.state.startWithdrawTime.toNumber()}
              onEnd={() => {
                refreshSelf()
              }}
            />
          </Row>
        )}
      </div>
      <IdoAlertText flag="2" className="pt-4 pb-2 border-t-2 border-white border-opacity-10" />
      <IdoAlertText flag="3" className="pt-2 pb-4" />
    </>
  )
}

function ProjectDetailsPanel({ className }: { className?: string }) {
  const { idoInfo } = usePageData()
  return (
    <div className={`detail-box ${className ?? ''}`}>
      {idoInfo && (
        <>
          <Row className="space-x-4">
            <h2 className="font-bold text-2xl">Project details</h2>
            {Object.entries(idoInfo.project.docs).map(([docName, linkAddress]) => (
              <Link key={docName} href={linkAddress}>
                {docName}
              </Link>
            ))}
          </Row>

          {/* <p className="details whitespace-pre-line my-6">{idoInfo.project.details}</p> */}
          <ReactMarkdown className="my-6 whitespace-pre-line mobile:text-sm">{idoInfo.project.details}</ReactMarkdown>
          {/* {idoInfo.project.alertDetails && (
            <p className="details-alert whitespace-pre-line my-6 italic">{idoInfo.project.alertDetails}</p>
          )} */}

          <Row className="space-x-4">
            {Object.entries(idoInfo.project.socials ?? {}).map(([socialMediaName, linkAddress]) => (
              <Link key={socialMediaName} href={linkAddress} className="p-2">
                <Icon size="md" iconSrc={`/icons/acceleraytor-${socialMediaName.toLowerCase()}.svg`} />
              </Link>
            ))}
          </Row>
        </>
      )}
    </div>
  )
}

function BottomInfoPanalFieldItem({ fieldName, fieldValue }: { fieldName?: ReactNode; fieldValue?: ReactNode }) {
  return (
    <Row className="info-item py-5 px-4">
      <div className="w-1/2">
        <div className="field-name mobile:text-sm">{fieldName}</div>
      </div>
      <div className="w-1/2">
        <div className="field-value mobile:text-sm">{fieldValue}</div>
      </div>
    </Row>
  )
}

function BottomInfoPanel() {
  const { idoInfo } = usePageData()
  return (
    <TabWithPanel
      className="rounded-lg overflow-hidden"
      values={['Pool Information']}
      tabGroupClassName="bg-ground-color-dark"
      tabItemClassName={(checked) => `py-2 border-b-2 ${checked ? 'border-current' : 'border-transparent'}`}
    >
      {idoInfo && (
        <>
          <TabWithPanel.Panel className="divide-y divide-white divide-opacity-10 bg-acceleraytor-card-bg cyberpunk-hero-bg-gradient-simi">
            <BottomInfoPanalFieldItem fieldName="Pool opens" fieldValue={toUTC(idoInfo.state.startTime.toNumber())} />
            <BottomInfoPanalFieldItem fieldName="Pool closes" fieldValue={toUTC(idoInfo.state.endTime.toNumber())} />
            <BottomInfoPanalFieldItem
              fieldName="Total Drop Boxes"
              fieldValue={`${formatNumber(idoInfo.raise)} ${idoInfo.base?.symbol ?? ''}`}
            />
            <BottomInfoPanalFieldItem
              fieldName="Per Drop Box"
              fieldValue={`${formatNumber(idoInfo.price)} ${idoInfo.quote?.symbol ?? ''}`}
            />
            <BottomInfoPanalFieldItem
              fieldName="Max winners"
              fieldValue={formatNumber(idoInfo.state.maxWinLotteries)}
            />
          </TabWithPanel.Panel>
        </>
      )}
    </TabWithPanel>
  )
}

function MiddleTicketPanelFieldItem({ fieldName, fieldValue }: { fieldName?: ReactNode; fieldValue?: ReactNode }) {
  return (
    <Row className="ticket-item py-1">
      <div className="w-[192px] mobile:w-32">
        <div className="field-name mobile:text-sm opacity-60 font-bold">{fieldName}</div>
      </div>
      <div>
        <div className="field-value mobile:text-sm">{fieldValue}</div>
      </div>
    </Row>
  )
}
function TicketPanel({ className }: { className?: string }) {
  const { idoInfo } = usePageData()
  const { connected } = useWallet()
  return (
    <Row className={`grid justify-center ${className ?? ''}`}>
      <div className="py-6 px-48 mobile:py-4 mobile:px-8 bg-ground-color-light rounded-3xl">
        <h2 className="mb-4 font-bold text-xl text-center">Ticket information</h2>
        <Row className="grid justify-center">
          <MiddleTicketPanelFieldItem
            fieldName={
              {
                '0': 'Lucky Ending Numbers',
                '1': 'All numbers not ending with',
                '2': 'Lucky Ending Numbers',
                '3': 'All Tickets Win',
                undefined: 'Lucky Ending Numbers'
              }[String(idoInfo?.state.winningTicketsTailNumber.isWinning)]
            }
            fieldValue={
              ['1', '2'].includes(String(idoInfo?.state.winningTicketsTailNumber.isWinning)) ? (
                <div>
                  {idoInfo?.state
                    .winningTicketsTailNumber!.tickets.map(
                      ({ no, isPartial }) => `${no}${isPartial ? '(partial)' : ''}`
                    )
                    .join(', ')}
                </div>
              ) : ['3'].includes(String(idoInfo?.state.winningTicketsTailNumber.isWinning)) ? (
                <div>(Every deposited ticket wins)</div>
              ) : (
                <div className="opacity-50">
                  {idoInfo?.status === 'closed' ? '(Lottery in progress)' : '(Numbers selected when lottery ends)'}
                </div>
              )
            }
          />
          <MiddleTicketPanelFieldItem
            fieldName="Your Ticket Numbers"
            fieldValue={
              idoInfo?.ledger?.depositedTickets?.length ? (
                <div className="grid grid-cols-5-auto gap-y-2 gap-x-8">
                  {idoInfo?.ledger?.depositedTickets?.map((ticket) => (
                    <TicketItem key={ticket.no} ticket={ticket} />
                  ))}
                </div>
              ) : (
                <div className="opacity-50">{connected ? '(No tickets deposited)' : '(Wallet not connected)'}</div>
              )
            }
          />
          <MiddleTicketPanelFieldItem
            fieldName="Your Winning Numbers"
            fieldValue={
              idoInfo?.ledger?.winningTickets?.length ? (
                <div className="grid grid-cols-5-auto gap-y-2 gap-x-8">
                  {idoInfo?.ledger?.winningTickets?.map((ticket) => (
                    <TicketItem key={ticket.no} ticket={ticket} />
                  ))}
                </div>
              ) : (
                <div className="opacity-50">
                  {connected
                    ? idoInfo?.status === 'closed'
                      ? idoInfo.ledger?.winningTickets?.length
                        ? '(Lottery in progress)'
                        : '(No winning tickets)'
                      : '(Numbers selected when lottery ends)'
                    : '(Wallet not connected)'}
                </div>
              )
            }
          />
        </Row>
      </div>
    </Row>
  )
}
export function TicketItem({ ticket }: { ticket?: TicketInfo }) {
  if (!ticket) return null
  return <div>{ticket.no}</div>
}
