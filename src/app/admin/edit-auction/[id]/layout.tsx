// src/app/admin/edit-auction/[id]/layout.tsx
import React from 'react'
import HeaderOne from '@/layouts/headers/HeaderOne'
import FooterOne from '@/layouts/footers/FooterOne'
import Divider from '@/components/common/Divider'

export default function EditAuctionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderOne />
      <Divider />
      {children}
      <Divider />
      <FooterOne />
    </>
  )
}
