"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Search, ArrowUpDown, Loader2, AlertCircle } from "lucide-react"

interface Contact {
  id: number
  ownerEmail: string
  contactName: string
  phoneNumber: string
  carrier: string
  createdAt: string
  updatedAt: string
}

interface CreateContactRequest {
  ownerEmail: string
  contactName: string
  phoneNumber: string
  carrier: string
}

// 기존 형태와의 호환성을 위한 레거시 인터페이스
interface LegacyContact {
  id: number
  name: string
  phone: string
}

export function AddressBook() {
  // 고정 설정값
  const BASE_URL = "https://phonebook-svc-dtd4f8f9cyfee5c0.koreacentral-01.azurewebsites.net"
  const FIXED_USER_EMAIL = "jessica0409@naver.com"

  const [contacts, setContacts] = useState<Contact[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [newContact, setNewContact] = useState({
    ownerEmail: FIXED_USER_EMAIL,
    contactName: "",
    phoneNumber: "",
    carrier: ""
  })
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // 연락처 조회 관련 상태
  const [ownerEmailFilter, setOwnerEmailFilter] = useState("test@example.com")
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)
  const [contactsError, setContactsError] = useState<string | null>(null)

  const carriers = ["SKT", "KT", "LG", "MVNO"]

  // 유효성 검증 함수들
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^01[016789]-?\d{3,4}-?\d{4}$/
    return phoneRegex.test(phone)
  }

  const validateContact = (contact: CreateContactRequest): string | null => {
    if (!validateEmail(contact.ownerEmail)) {
      return "올바른 이메일 형식을 입력해주세요."
    }
    if (!contact.contactName.trim()) {
      return "연락처 이름은 필수입니다."
    }
    if (!validatePhoneNumber(contact.phoneNumber)) {
      return "올바른 휴대폰 번호 형식을 입력해주세요. (예: 010-1234-5678)"
    }
    if (!carriers.includes(contact.carrier)) {
      return "통신사를 선택해주세요."
    }
    return null
  }

  // API 호출 함수
  const createContact = async (contactData: CreateContactRequest): Promise<Contact> => {
    const response = await fetch(`${BASE_URL}/api/phonebook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`연락처 생성 실패: ${response.status} ${response.statusText} ${errorText}`)
    }

    return response.json()
  }

  const fetchContactsByOwner = async (ownerEmail: string): Promise<Contact[]> => {
    const response = await fetch(`${BASE_URL}/api/phonebook/owner/${encodeURIComponent(ownerEmail)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`연락처 조회 실패: ${response.status} ${response.statusText} ${errorText}`)
    }

    return response.json()
  }

  const filteredContacts = contacts
    .filter(
      (contact) => 
        contact.contactName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        contact.phoneNumber.includes(searchTerm)
    )
    .sort((a, b) => {
      const comparison = a.contactName.localeCompare(b.contactName, "ko", { sensitivity: "base" })
      return sortOrder === "asc" ? comparison : -comparison
    })



  const handleAddContact = async () => {
    setError(null)
    setSuccessMessage(null)

    // 유효성 검증
    const validationError = validateContact(newContact)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    
    try {
      const createdContact = await createContact(newContact)
      setContacts(prev => [...prev, createdContact])
      setNewContact({
        ownerEmail: FIXED_USER_EMAIL,
        contactName: "",
        phoneNumber: "",
        carrier: ""
      })
      setSuccessMessage("연락처가 성공적으로 추가되었습니다!")
      setIsAddDialogOpen(false)
      
      // 성공 메시지를 3초 후 제거
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error("연락처 추가 실패:", error)
      setError(error instanceof Error ? error.message : "연락처 추가에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact)
    setNewContact({
      ownerEmail: contact.ownerEmail,
      contactName: contact.contactName,
      phoneNumber: contact.phoneNumber,
      carrier: contact.carrier
    })
  }

  const handleUpdateContact = () => {
    // 현재는 편집 기능 비활성화 (API 엔드포인트가 없음)
    alert("편집 기능은 현재 구현되지 않았습니다.")
    setEditingContact(null)
    setNewContact({
      ownerEmail: FIXED_USER_EMAIL,
      contactName: "",
      phoneNumber: "",
      carrier: ""
    })
  }

  const handleDeleteContact = (id: number) => {
    // 현재는 삭제 기능 비활성화 (API 엔드포인트가 없음)
    if (confirm("삭제 기능은 현재 구현되지 않았습니다. 로컬에서만 제거하시겠습니까?")) {
      setContacts(contacts.filter((c) => c.id !== id))
    }
  }

  const handleFetchContacts = async () => {
    setIsLoadingContacts(true)
    setContactsError(null)
    setError(null)
    setSuccessMessage(null)

    try {
      const fetchedContacts = await fetchContactsByOwner(FIXED_USER_EMAIL)
      setContacts(fetchedContacts)
      setSuccessMessage(`${FIXED_USER_EMAIL}의 연락처 ${fetchedContacts.length}개를 불러왔습니다.`)
      
      // 성공 메시지를 3초 후 제거
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error("연락처 조회 실패:", error)
      setContactsError(error instanceof Error ? error.message : "연락처 조회에 실패했습니다.")
      setContacts([]) // 실패 시 빈 배열로 초기화
    } finally {
      setIsLoadingContacts(false)
    }
  }

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  // 페이지 로드 시 자동으로 연락처 가져오기
  useEffect(() => {
    handleFetchContacts()
  }, []) // 빈 의존성 배열로 컴포넌트 마운트 시에만 실행

  return (
    <div className="h-[calc(100vh-80px)] p-6">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        {/* Success/Error Messages */}
        {successMessage && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {contactsError && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {contactsError}
            </AlertDescription>
          </Alert>
        )}

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
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Contact</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ownerEmail">Owner Email (Fixed)</Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      value={newContact.ownerEmail}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      value={newContact.contactName}
                      onChange={(e) => setNewContact({ ...newContact, contactName: e.target.value })}
                      placeholder="Enter contact name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={newContact.phoneNumber}
                      onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })}
                      placeholder="010-1234-5678"
                    />
                  </div>
                  <div>
                    <Label htmlFor="carrier">Carrier *</Label>
                    <Select
                      value={newContact.carrier}
                      onValueChange={(value) => setNewContact({ ...newContact, carrier: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select carrier" />
                      </SelectTrigger>
                      <SelectContent>
                        {carriers.map((carrier) => (
                          <SelectItem key={carrier} value={carrier}>
                            {carrier}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    onClick={handleAddContact} 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Contact"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Load Contacts */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-foreground">
                  Load Contacts for {FIXED_USER_EMAIL}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Current contacts: {contacts.length} items
                </p>
              </div>
              <Button 
                onClick={handleFetchContacts}
                disabled={isLoadingContacts}
              >
                {isLoadingContacts ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Load Contacts
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

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
            {isLoadingContacts ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-muted-foreground">연락처를 불러오는 중...</p>
                  </div>
                </CardContent>
              </Card>
            ) : filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <Card key={contact.id} className="border-border">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground font-sans">{contact.contactName}</h3>
                      <p className="text-muted-foreground font-mono">{contact.phoneNumber}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {contact.carrier}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {contact.ownerEmail}
                        </span>
                      </div>
                    </div>
                  <div className="flex space-x-2">
                    <Dialog
                      open={editingContact?.id === contact.id}
                      onOpenChange={(open) => {
                        if (!open) {
                          setEditingContact(null)
                          setNewContact({
                            ownerEmail: FIXED_USER_EMAIL,
                            contactName: "",
                            phoneNumber: "",
                            carrier: ""
                          })
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleEditContact(contact)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Edit Contact</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-ownerEmail">Owner Email</Label>
                            <Input
                              id="edit-ownerEmail"
                              type="email"
                              value={newContact.ownerEmail}
                              onChange={(e) => setNewContact({ ...newContact, ownerEmail: e.target.value })}
                              disabled
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-contactName">Contact Name</Label>
                            <Input
                              id="edit-contactName"
                              value={newContact.contactName}
                              onChange={(e) => setNewContact({ ...newContact, contactName: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-phoneNumber">Phone Number</Label>
                            <Input
                              id="edit-phoneNumber"
                              value={newContact.phoneNumber}
                              onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-carrier">Carrier</Label>
                            <Select
                              value={newContact.carrier}
                              onValueChange={(value) => setNewContact({ ...newContact, carrier: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select carrier" />
                              </SelectTrigger>
                              <SelectContent>
                                {carriers.map((carrier) => (
                                  <SelectItem key={carrier} value={carrier}>
                                    {carrier}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={handleUpdateContact} className="w-full" disabled>
                            Update Contact (Not Available)
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
              ))
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground font-mono">
                    {searchTerm 
                      ? "검색 결과가 없습니다." 
                      : contacts.length === 0 
                        ? "연락처가 없습니다. 새 연락처를 추가하거나 'Load Contacts' 버튼을 눌러주세요." 
                        : "필터링된 연락처가 없습니다."
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
