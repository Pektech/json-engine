import { TopAppBar } from '@/components/layout/TopAppBar'
import { SideNavBar } from '@/components/layout/SideNavBar'
import { MainWorkspace } from '@/components/layout/MainWorkspace'

export default function Home() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopAppBar />
      <div className="flex flex-1 overflow-hidden">
        <SideNavBar />
        <MainWorkspace />
      </div>
    </div>
  )
}
