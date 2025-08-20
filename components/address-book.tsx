"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Search, ArrowUpDown } from "lucide-react"

interface Contact {
  id: number
  name: string
  phone: string
}

export function AddressBook() {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: 1, name: "김철수", phone: "010-1234-5678" },
    { id: 2, name: "이영희", phone: "010-9876-5432" },
    { id: 3, name: "박민수", phone: "010-5555-1234" },
  ])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [newContact, setNewContact] = useState({ name: "", phone: "" })
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const filteredContacts = contacts
    .filter(
      (contact) => contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || contact.phone.includes(searchTerm),
    )
    .sort((a, b) => {
      const comparison = a.name.localeCompare(b.name, "ko", { sensitivity: "base" })
      return sortOrder === "asc" ? comparison : -comparison
    })

  const handleAddContact = () => {
    if (newContact.name.trim() && newContact.phone.trim()) {
      const id = Math.max(...contacts.map((c) => c.id), 0) + 1
      setContacts([...contacts, { id, ...newContact }])
      setNewContact({ name: "", phone: "" })
      setIsAddDialogOpen(false)
    }
  }

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact)
    setNewContact({ name: contact.name, phone: contact.phone })
  }

  const handleUpdateContact = () => {
    if (editingContact && newContact.name.trim() && newContact.phone.trim()) {
      setContacts(
        contacts.map((c) =>
          c.id === editingContact.id ? { ...c, name: newContact.name, phone: newContact.phone } : c,
        ),
      )
      setEditingContact(null)
      setNewContact({ name: "", phone: "" })
    }
  }

  const handleDeleteContact = (id: number) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      setContacts(contacts.filter((c) => c.id !== id))
    }
  }

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  return (
    <div className="h-[calc(100vh-80px)] p-6">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-foreground font-sans">Address Book</h2>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={toggleSort} className="font-sans bg-transparent">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort {sortOrder === "asc" ? "A-Z" : "Z-A"}
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="font-sans">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Contact
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Contact</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      placeholder="Enter contact name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <Button onClick={handleAddContact} className="w-full">
                    Add Contact
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid gap-4">
            {filteredContacts.map((contact) => (
              <Card key={contact.id} className="border-border">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-semibold text-foreground font-sans">{contact.name}</h3>
                    <p className="text-muted-foreground font-mono">{contact.phone}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Dialog
                      open={editingContact?.id === contact.id}
                      onOpenChange={(open) => {
                        if (!open) {
                          setEditingContact(null)
                          setNewContact({ name: "", phone: "" })
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleEditContact(contact)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Contact</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                              id="edit-name"
                              value={newContact.name}
                              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-phone">Phone Number</Label>
                            <Input
                              id="edit-phone"
                              value={newContact.phone}
                              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                            />
                          </div>
                          <Button onClick={handleUpdateContact} className="w-full">
                            Update Contact
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteContact(contact.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredContacts.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground font-mono">
                  {searchTerm ? "No contacts found matching your search." : "No contacts yet. Add your first contact!"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
