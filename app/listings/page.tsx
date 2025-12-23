import { ListingsManagement } from "@/components/listings-management"
import { Header } from "@/components/header"

export default function ListingsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <ListingsManagement />
      </div>
    </div>
  )
}

