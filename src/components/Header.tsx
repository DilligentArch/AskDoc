import { SignedIn, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { FilePlus2 } from 'lucide-react'
import { ModeToggle } from './ModeToggle'

function Header() {
  return (
    <div className='flex justify-between bg-white shadow-sm p-5 border-b '>
        <Link 
        href='/' className='text-2xl text-indigo-600'>
            AskDoc
        </Link>


        <SignedIn>
            <div className='flex items-center space-x-2 '>
{/* 
                <ModeToggle></ModeToggle> */}
                <Button asChild variant="outline" >
                    <Link 
                    href='/dashboard'> My Documents
                    </Link>
                </Button>
                <Button asChild variant="outline" className='text-indigo-600'>
                    <Link 
                    href='/dashboard/upload'> <FilePlus2 className='text-indigo-600'></FilePlus2>
                    </Link>
                </Button>
                <UserButton></UserButton>
            </div>
        </SignedIn>
    </div>
  )
}

export default Header