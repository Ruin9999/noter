"use client"

import Link from "next/link";
import Image from "next/image";
import { Input, inputStyles } from "@/components/ui/input";
import CmdkSearchBar from "@/components/common/cmdk-search-bar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Menu, Plus, UserIcon, BookmarkIcon, Cog, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CommandDialog, CommandInput, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuItemLink, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { api } from "@convex/api";
import { useDebouncedCallback } from "use-debounce";
import { usePaginatedQuery, useQuery } from "convex/react";
import { useUser, useClerk, SignedIn, SignedOut } from "@clerk/nextjs";

export function Navbar() {
  const [searchValue, setSearchValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const setDebouncedSearchValue = useDebouncedCallback(setSearchValue, 300);
  const { results : notes } = usePaginatedQuery(api.notes.get.list, { fulltext: searchValue }, { initialNumItems: 5 });
  const tags = useQuery(api.tags.get.list, { fulltext: searchValue, limit: 3 });

  const user = useUser();
  const { signOut } = useClerk();

  return (
    <nav className="flex items-center justify-between p-4 border-b border-gray-100">
      <div className="flex items-center space-x-4">
        <div className="relative w-8 h-8 sm:w-10 sm:h-10">
          <Link href="/notes">
            <Image
              src="/Logo.png"
              alt="Noter logo"
              layout="fill"
              objectFit="contain"
              priority
            />
          </Link>
        </div>
        <CmdkSearchBar className="hidden sm:flex" onActivate={() => setIsDialogOpen(true)} />
      </div>

      <SignedIn>
        <div className="flex items-center space-x-4">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Avatar className="hidden sm:block">
                <AvatarImage src={user.user?.imageUrl} />
                <AvatarFallback>{user.user?.username?.[0]}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px] translate-x-[-10px]">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <DropdownMenuItemLink href={`/profile/${user.user?.id}`} onClick={() => setIsDropdownOpen(false)}>
                    <UserIcon className="size-4" />
                    <span>Profile</span>
                  </DropdownMenuItemLink>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <DropdownMenuItemLink href="/library" onClick={() => setIsDropdownOpen(false)}>
                    <BookmarkIcon className="size-4" />
                    <span>My notes</span>
                  </DropdownMenuItemLink>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />

              {/* Admin page */}
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <DropdownMenuItemLink href="/admin" onClick={() => setIsDropdownOpen(false)}>
                    <Cog className="size-4" />
                    <span>Admin dashboard</span>
                  </DropdownMenuItemLink>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => signOut()} className="flex items-center gap-2 w-full text-red-500">
                <LogOut className="size-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile UI */}
          <Sheet>
            <SheetTrigger asChild>
              <Menu className="size-5 sm:hidden" />
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="text-left text-3xl">Menu</SheetTitle>
              </SheetHeader>
              <div className="h-full flex flex-col py-3">
                <div className="flex-1">
                  <div
                    onClick={() => setIsDialogOpen(true)}
                    className={cn(
                      inputStyles,
                      "flex items-center w-full gap-2 text-muted-foreground hover:cursor-text mr-auto rounded-full",
                    )}>
                    <Search className="size-4" />
                    <span>Search notes</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3 py-4">
                  <Avatar className="size-9 mt-1">
                    <AvatarImage src={user.user?.imageUrl} />
                    <AvatarFallback>{user.user?.username?.[0] || user.user?.fullName?.[0] || ""}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">{user.user?.username || user.user?.firstName || user.user?.lastName}</h3>
                    <p className="text-sm font-bold">{user.user?.primaryEmailAddress?.emailAddress || ''}</p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </SignedIn>

      <CommandDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} shouldFilter={false}>
        <CommandInput
          onChangeCapture={(e) => setDebouncedSearchValue(e.currentTarget.value)}
          placeholder="Search ..."
        />
        
        <CommandList>
          {notes?.length === 0 ? (
            <span>No results found.</span>
          ) : (
            <>
              {notes.map((note) => (
                <CommandItem key={note._id}>
                  <Link href={`/notes/view?id=${note._id}`} onClick={() => setIsDialogOpen(false)}>
                    {note.title}
                  </Link>
                </CommandItem>
              ))}
              {tags?.map((tag) => (
                <CommandItem key={tag._id}>
                  <Link href={`/tags/${tag.tag}`} onClick={() => setIsDialogOpen(false)}>
                    {tag.tag}
                  </Link>
                </CommandItem>
              ))}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </nav>
  )
}



// function CommentBubble({ comment } : { comment : Doc<"comments">}) {

//   const [user, setUser] = useState<User>();
  
//   useEffect(() => {
//     async function GetUserInformation() {
//       const { data } = await axios.get("/api/user", {
//         params: { id: comment.userId }
//       })

//       setUser(data.user)
//     }
//     GetUserInformation();
//   }, [comment])
  
//   return(<div className="flex items-start space-x-3 py-2 px-3">
//     <Avatar className="size-10 mt-1">
//       <AvatarImage src={user?.imageUrl} />
//       <AvatarFallback>{user?.username?.slice(0,2).toUpperCase()}</AvatarFallback>
//     </Avatar>
//     <div className="flex-grow min-w-0">
//       <div className="flex items-center space-x-2">
//         <h3 className="text-sm font-medium text-foreground truncate">{user?.username || user?.firstName || user?.lastName}</h3>
//         <span className="text-xs text-muted-foreground">•</span>
//         <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDistanceToNow(new Date(comment._creationTime), { addSuffix: true })}</span>
//       </div>
//       <p className="mt-0.5 text-sm text-foreground break-words">{comment.content}</p>
//     </div>
//   </div>)