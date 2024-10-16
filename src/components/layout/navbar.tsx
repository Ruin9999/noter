"use client"

import Link from "next/link";
import Image from "next/image";
import { inputStyles } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserIcon, BookmarkIcon, Cog8ToothIcon, ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { CommandDialog, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuItemLink, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";
import { api } from "@convex/api";
import { useState, useEffect } from "react";
import { usePaginatedQuery, useQuery } from "convex/react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useDebouncedCallback } from "use-debounce";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { useSearch } from "../providers/SearchContextProvider";

import { PlusIcon } from 'lucide-react';

export function Navbar() {
  const [ searchValue, setSearchValue ] = useState(""); 
  const [ isDropdownOpen, setIsDropdownOpen ] = useState(false);
  const [ isDialogOpen, setIsDialogOpen ] = useState(false);
  const setDebouncedSearchValue = useDebouncedCallback(setSearchValue, 300);
  const { results  } = usePaginatedQuery(
    api.notes.get.list,
    { fulltext: searchValue },
    { initialNumItems: 5 }
  )

  const user = useUser();
  const { signOut } = useClerk();
  const userProfileImageUrl = user.user?.imageUrl;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if(e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsDialogOpen(prevState => !prevState);
      }
    }

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [])

  return(
    <div className="flex justify-center border-b border-gray-100">
      <div className="h-[60px] px-[1%] flex gap-4 items-center w-screen">
        <Link href="/notes">
          <Image
            priority
            src="/Logo.png"
            alt="Noter Logo"
            height={35}
            width={35}
          />
        </Link>

        <SignedIn>
          <div 
            onClick={() => setIsDialogOpen(true)}
            className={cn(
              inputStyles,
              "flex items-center w-full md:w-[300px]  gap-2 text-muted-foreground hover:cursor-text mr-auto rounded-full"
            )}>
            <MagnifyingGlassIcon className="h-3 w-3" aria-hidden="true" />
            <div className="hidden md:flex w-full">
              <span className="mr-auto">Search notes, topics ...</span>
              <kbd className="rounded border bg-muted px-1.5 text-[10px] shadow-sm">
                <span>⌘ K</span>
              </kbd>
            </div>
          </div>

          <Link
            href="/notes/upload"
            className={cn(
              buttonVariants({ variant: "link" }),
              "flex gap-2 px-4 text-sm hover:underline" 
            )}
          >
            <PlusIcon className="ml-auto mt-1 size-4" /> 
            <span className="hidden md:inline-block text-sm">Create Note</span>
          </Link>

          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-[35px] w-[35px]">
                <AvatarImage src={userProfileImageUrl}/>
                <AvatarFallback />
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px] translate-x-[-10px]">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <DropdownMenuItemLink href={`/profile/${user.user?.id}`} onClick={() =>setIsDropdownOpen(false)}>
                    <UserIcon className="size-4" />
                    <span>Profile</span>
                  </DropdownMenuItemLink>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <DropdownMenuItemLink href="/library" onClick={() =>setIsDropdownOpen(false)}>
                    <BookmarkIcon className="size-4" />
                    <span>My notes</span>
                  </DropdownMenuItemLink>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />

              {/* Admin page */}
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <DropdownMenuItemLink href="/admin" onClick={() =>setIsDropdownOpen(false)}>
                    <Cog8ToothIcon className="size-4" />
                    <span>Admin dashboard</span>
                  </DropdownMenuItemLink>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => signOut()} className="flex items-center gap-2 w-full text-red-500">
                <ArrowRightStartOnRectangleIcon className="size-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SignedIn>

        <SignedOut>
          <Link className={cn(buttonVariants({variant: "link"}), "ml-auto")} href="/sign-in">Sign In</Link>
          <Link className={buttonVariants({variant: "default"})} href="/sign-up">Get Started</Link>
        </SignedOut>
      </div>

      <CommandDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} shouldFilter={false}>
        <CommandInput
          onChangeCapture={(e) => setDebouncedSearchValue(e.currentTarget.value)}
          placeholder="Search ..."
        />
        <CommandList>
          {!results ? (
            <span>No results found.</span>
          ) : (
            results.map((item) => (
              <CommandItem key={item._id}>
                <Link href={`/notes/view?id=${item._id}`}>
                  {item.title}
                </Link>
              </CommandItem>
            ))
          )}
        </CommandList>
      </CommandDialog>
    </div>
  )
}