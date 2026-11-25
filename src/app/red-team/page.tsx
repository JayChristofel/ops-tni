import { TargetBoard } from '@/components/red-team/TargetBoard'
import { AttackTerminal } from '@/components/red-team/AttackTerminal'
import { KillChain } from '@/components/red-team/KillChain'
import { C2Panel } from '@/components/red-team/C2Panel'
import { PayloadSelector } from '@/components/red-team/PayloadSelector'
import { ExfilTracker } from '@/components/red-team/ExfilTracker'

export default function RedTeamPage() {
  return (
    <div className="layout-red">
      <TargetBoard className="area-targets" />
      <AttackTerminal className="area-terminal" />
      <KillChain className="area-killchain" />
      <div className="area-lower layout-red-lower">
        <C2Panel />
        <PayloadSelector />
        <ExfilTracker />
      </div>
    </div>
  )
}
