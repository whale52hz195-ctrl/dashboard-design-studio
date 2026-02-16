import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, Plus, Pencil, Trash2, Star, Upload, Play, Pause, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  mockReportReasons,
  mockCurrencies,
  mockProfileImages,
  mockAudioFiles,
  mockVideoFiles,
  defaultGeneralSettings,
  defaultPaymentSettings,
  defaultWithdrawalSettings,
  defaultGameSettings,
} from "@/data/mockSettingsData";

// Reusable section wrapper
const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="border border-gray-700/50 rounded-lg p-5 space-y-4">
    <div className="flex items-center gap-2 mb-2">
      <h3 className="text-white font-semibold text-sm">{title}</h3>
      <Info className="h-4 w-4 text-gray-500" />
    </div>
    {children}
  </div>
);

const SettingField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-gray-400 text-xs">{label}</Label>
    {children}
  </div>
);

const inputClass = "bg-[#1a1a2e] border-gray-700 text-white placeholder:text-gray-500 h-9 text-sm";

export default function Settings() {
  const { toast } = useToast();
  const [general, setGeneral] = useState(defaultGeneralSettings);
  const [payment, setPayment] = useState(defaultPaymentSettings);
  const [withdrawal, setWithdrawal] = useState(defaultWithdrawalSettings);
  const [game, setGame] = useState(defaultGameSettings);
  const [reportReasons, setReportReasons] = useState(mockReportReasons);
  const [currencies, setCurrencies] = useState(mockCurrencies);
  const [profileImages, setProfileImages] = useState(mockProfileImages);
  const [audioFiles, setAudioFiles] = useState(mockAudioFiles);
  const [videoFiles, setVideoFiles] = useState(mockVideoFiles);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  // Dialogs
  const [reasonDialog, setReasonDialog] = useState(false);
  const [currencyDialog, setCurrencyDialog] = useState(false);
  const [editingReason, setEditingReason] = useState<{ id?: string; title: string }>({ title: "" });
  const [editingCurrency, setEditingCurrency] = useState<{ id?: string; name: string; symbol: string; countryCode: string; currencyCode: string }>({ name: "", symbol: "", countryCode: "", currencyCode: "" });

  const handleSave = () => {
    toast({ title: "Settings Saved", description: "Your changes have been saved successfully." });
  };

  const handleSaveReason = () => {
    if (editingReason.id) {
      setReportReasons(prev => prev.map(r => r.id === editingReason.id ? { ...r, title: editingReason.title, updatedAt: new Date().toISOString().split("T")[0] } : r));
    } else {
      setReportReasons(prev => [...prev, { id: Date.now().toString(), title: editingReason.title, createdAt: new Date().toISOString().split("T")[0], updatedAt: new Date().toISOString().split("T")[0] }]);
    }
    setReasonDialog(false);
    setEditingReason({ title: "" });
  };

  const handleSaveCurrency = () => {
    if (editingCurrency.id) {
      setCurrencies(prev => prev.map(c => c.id === editingCurrency.id ? { ...c, ...editingCurrency } : c));
    } else {
      setCurrencies(prev => [...prev, { ...editingCurrency, id: Date.now().toString(), isDefault: false }]);
    }
    setCurrencyDialog(false);
    setEditingCurrency({ name: "", symbol: "", countryCode: "", currencyCode: "" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="bg-[#1a1a2e] border border-gray-700/50 h-auto p-1 flex w-max gap-1">
              {["general", "payment", "content-moderation", "report-reasons", "currency", "withdrawal", "profile-management", "audio-management", "video-management", "game"].map(tab => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400 text-xs px-3 py-2 whitespace-nowrap rounded-md"
                >
                  {tab.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* General */}
          <TabsContent value="general" className="space-y-4 mt-4">
            <SettingSection title="Call Rate Setting">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingField label="Private Video Call Rate (coins/minute)">
                  <Input className={inputClass} value={general.privateVideoCallRate} onChange={e => setGeneral(p => ({ ...p, privateVideoCallRate: e.target.value }))} />
                </SettingField>
                <SettingField label="Private Audio Call Rate (coins/minute)">
                  <Input className={inputClass} value={general.privateAudioCallRate} onChange={e => setGeneral(p => ({ ...p, privateAudioCallRate: e.target.value }))} />
                </SettingField>
              </div>
            </SettingSection>

            <SettingSection title="App Setting">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <SettingField label="Login Bonus">
                  <Input className={inputClass} value={general.loginBonus} onChange={e => setGeneral(p => ({ ...p, loginBonus: e.target.value }))} />
                </SettingField>
                <SettingField label="Duration of Shorts (seconds)">
                  <Input className={inputClass} value={general.durationOfShorts} onChange={e => setGeneral(p => ({ ...p, durationOfShorts: e.target.value }))} />
                </SettingField>
                <SettingField label="PK End Time (seconds)">
                  <Input className={inputClass} value={general.pkEndTime} onChange={e => setGeneral(p => ({ ...p, pkEndTime: e.target.value }))} />
                </SettingField>
                <SettingField label="Admin Rate (%)">
                  <Input className={inputClass} value={general.adminRate} onChange={e => setGeneral(p => ({ ...p, adminRate: e.target.value }))} />
                </SettingField>
              </div>
            </SettingSection>

            <SettingSection title="Agora Setting">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingField label="Agora App ID">
                  <Input className={inputClass} value={general.agoraAppId} onChange={e => setGeneral(p => ({ ...p, agoraAppId: e.target.value }))} placeholder="Enter Agora App ID" />
                </SettingField>
                <SettingField label="Agora App Certificate">
                  <Input className={inputClass} value={general.agoraAppCertificate} onChange={e => setGeneral(p => ({ ...p, agoraAppCertificate: e.target.value }))} placeholder="Enter Agora App Certificate" />
                </SettingField>
              </div>
            </SettingSection>

            <SettingSection title="Banner Announcement Setting">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingField label="Minimum Gift Announcement Coin">
                  <Input className={inputClass} value={general.minGiftAnnouncementCoin} onChange={e => setGeneral(p => ({ ...p, minGiftAnnouncementCoin: e.target.value }))} />
                </SettingField>
                <SettingField label="Minimum Game Announcement Coin">
                  <Input className={inputClass} value={general.minGameAnnouncementCoin} onChange={e => setGeneral(p => ({ ...p, minGameAnnouncementCoin: e.target.value }))} />
                </SettingField>
              </div>
            </SettingSection>

            <SettingSection title="Fake Data Setting">
              <div className="flex items-center gap-3">
                <Switch checked={general.fakeDataEnabled} onCheckedChange={v => setGeneral(p => ({ ...p, fakeDataEnabled: v }))} />
                <span className="text-gray-300 text-sm">Enable Fake Data</span>
              </div>
            </SettingSection>

            <SettingSection title="Policy Links">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingField label="Privacy Policy Link">
                  <Input className={inputClass} value={general.privacyPolicyLink} onChange={e => setGeneral(p => ({ ...p, privacyPolicyLink: e.target.value }))} />
                </SettingField>
                <SettingField label="Terms of Use Policy Link">
                  <Input className={inputClass} value={general.termsOfUseLink} onChange={e => setGeneral(p => ({ ...p, termsOfUseLink: e.target.value }))} />
                </SettingField>
              </div>
            </SettingSection>

            <SettingSection title="Shorts Effect Setting">
              <div className="flex items-center gap-3 mb-3">
                <Switch checked={general.shortsEffectEnabled} onCheckedChange={v => setGeneral(p => ({ ...p, shortsEffectEnabled: v }))} />
                <span className="text-gray-300 text-sm">Enable Shorts Effect</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingField label="License Key">
                  <Input className={inputClass} value={general.shortsLicenseKey} onChange={e => setGeneral(p => ({ ...p, shortsLicenseKey: e.target.value }))} placeholder="Enter License Key" />
                </SettingField>
                <SettingField label="License Secret">
                  <Input className={inputClass} value={general.shortsLicenseSecret} onChange={e => setGeneral(p => ({ ...p, shortsLicenseSecret: e.target.value }))} placeholder="Enter License Secret" />
                </SettingField>
              </div>
            </SettingSection>

            <SettingSection title="Watermark Setting">
              <div className="flex items-center gap-3 mb-3">
                <Switch checked={general.watermarkEnabled} onCheckedChange={v => setGeneral(p => ({ ...p, watermarkEnabled: v }))} />
                <span className="text-gray-300 text-sm">Enable Watermark</span>
              </div>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-purple-500/50 transition-colors">
                <Upload className="h-8 w-8 text-gray-500" />
                <p className="text-gray-500 text-sm">Click to upload watermark image</p>
              </div>
            </SettingSection>

            <SettingSection title="Lucky Gift Setting">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingField label="Admin Tax Percent (%)">
                  <Input className={inputClass} value={general.adminTaxPercent} onChange={e => setGeneral(p => ({ ...p, adminTaxPercent: e.target.value }))} />
                </SettingField>
                <SettingField label="Receiver Share Percent (%)">
                  <Input className={inputClass} value={general.receiverSharePercent} onChange={e => setGeneral(p => ({ ...p, receiverSharePercent: e.target.value }))} />
                </SettingField>
              </div>
            </SettingSection>

            <SettingSection title="Firebase Notification Setting">
              <SettingField label="Private Key JSON">
                <Textarea className={`${inputClass} min-h-[120px]`} value={general.firebasePrivateKey} onChange={e => setGeneral(p => ({ ...p, firebasePrivateKey: e.target.value }))} placeholder="Paste your Firebase private key JSON here..." />
              </SettingField>
            </SettingSection>
          </TabsContent>

          {/* Payment */}
          <TabsContent value="payment" className="space-y-4 mt-4">
            <SettingSection title="Stripe Setting">
              <div className="flex items-center gap-3 mb-3">
                <Switch checked={payment.stripeEnabled} onCheckedChange={v => setPayment(p => ({ ...p, stripeEnabled: v }))} />
                <span className="text-gray-300 text-sm">Enable Stripe</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingField label="Publishable Key">
                  <Input className={inputClass} value={payment.stripePublishableKey} onChange={e => setPayment(p => ({ ...p, stripePublishableKey: e.target.value }))} placeholder="pk_..." />
                </SettingField>
                <SettingField label="Secret Key">
                  <Input className={inputClass} type="password" value={payment.stripeSecretKey} onChange={e => setPayment(p => ({ ...p, stripeSecretKey: e.target.value }))} placeholder="sk_..." />
                </SettingField>
              </div>
            </SettingSection>

            <SettingSection title="Razorpay Setting">
              <div className="flex items-center gap-3 mb-3">
                <Switch checked={payment.razorpayEnabled} onCheckedChange={v => setPayment(p => ({ ...p, razorpayEnabled: v }))} />
                <span className="text-gray-300 text-sm">Enable Razorpay</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingField label="Razorpay ID">
                  <Input className={inputClass} value={payment.razorpayId} onChange={e => setPayment(p => ({ ...p, razorpayId: e.target.value }))} placeholder="rzp_..." />
                </SettingField>
                <SettingField label="Secret Key">
                  <Input className={inputClass} type="password" value={payment.razorpaySecretKey} onChange={e => setPayment(p => ({ ...p, razorpaySecretKey: e.target.value }))} placeholder="Enter Secret Key" />
                </SettingField>
              </div>
            </SettingSection>

            <SettingSection title="Flutterwave Setting">
              <div className="flex items-center gap-3 mb-3">
                <Switch checked={payment.flutterwaveEnabled} onCheckedChange={v => setPayment(p => ({ ...p, flutterwaveEnabled: v }))} />
                <span className="text-gray-300 text-sm">Enable Flutterwave</span>
              </div>
              <SettingField label="Flutterwave ID">
                <Input className={inputClass} value={payment.flutterwaveId} onChange={e => setPayment(p => ({ ...p, flutterwaveId: e.target.value }))} placeholder="Enter Flutterwave ID" />
              </SettingField>
            </SettingSection>

            <SettingSection title="Google Play Setting">
              <div className="flex items-center gap-3 mb-3">
                <Switch checked={payment.googlePlayEnabled} onCheckedChange={v => setPayment(p => ({ ...p, googlePlayEnabled: v }))} />
                <span className="text-gray-300 text-sm">Enable Google Play</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingField label="Service Account Email">
                  <Input className={inputClass} value={payment.googlePlayServiceEmail} onChange={e => setPayment(p => ({ ...p, googlePlayServiceEmail: e.target.value }))} placeholder="service@project.iam.gserviceaccount.com" />
                </SettingField>
                <SettingField label="Private Key">
                  <Input className={inputClass} type="password" value={payment.googlePlayPrivateKey} onChange={e => setPayment(p => ({ ...p, googlePlayPrivateKey: e.target.value }))} placeholder="Enter Private Key" />
                </SettingField>
              </div>
            </SettingSection>
          </TabsContent>

          {/* Content Moderation */}
          <TabsContent value="content-moderation" className="space-y-4 mt-4">
            <SettingSection title="Sightengine Configuration">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingField label="User">
                  <Input className={inputClass} placeholder="Enter Sightengine User" />
                </SettingField>
                <SettingField label="API Secret">
                  <Input className={inputClass} type="password" placeholder="Enter API Secret" />
                </SettingField>
              </div>
            </SettingSection>

            <SettingSection title="Content Moderation Keywords">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingField label="Video Banned Keywords">
                  <Select>
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Select keywords..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="violence">Violence</SelectItem>
                      <SelectItem value="nudity">Nudity</SelectItem>
                      <SelectItem value="hate">Hate Speech</SelectItem>
                      <SelectItem value="drugs">Drugs</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingField>
                <SettingField label="Post Banned Keywords">
                  <Select>
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Select keywords..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spam">Spam</SelectItem>
                      <SelectItem value="abuse">Abuse</SelectItem>
                      <SelectItem value="scam">Scam</SelectItem>
                      <SelectItem value="fake">Fake News</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingField>
              </div>
            </SettingSection>
          </TabsContent>

          {/* Report Reasons */}
          <TabsContent value="report-reasons" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold">Report Reasons</h3>
              <Dialog open={reasonDialog} onOpenChange={setReasonDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-1 text-xs" onClick={() => setEditingReason({ title: "" })}>
                    <Plus className="h-4 w-4" /> Add New Reason
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a1a2e] border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>{editingReason.id ? "Edit" : "Add"} Report Reason</DialogTitle>
                  </DialogHeader>
                  <SettingField label="Reason Title">
                    <Input className={inputClass} value={editingReason.title} onChange={e => setEditingReason(p => ({ ...p, title: e.target.value }))} placeholder="Enter reason title" />
                  </SettingField>
                  <DialogFooter>
                    <Button onClick={handleSaveReason} className="bg-purple-600 hover:bg-purple-700">Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="border border-gray-700/50 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-transparent">
                    <TableHead className="text-gray-400">Title</TableHead>
                    <TableHead className="text-gray-400">Created At</TableHead>
                    <TableHead className="text-gray-400">Updated At</TableHead>
                    <TableHead className="text-gray-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportReasons.map(reason => (
                    <TableRow key={reason.id} className="border-gray-700/50 hover:bg-purple-600/5">
                      <TableCell className="text-white">{reason.title}</TableCell>
                      <TableCell className="text-gray-400">{reason.createdAt}</TableCell>
                      <TableCell className="text-gray-400">{reason.updatedAt}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => { setEditingReason({ id: reason.id, title: reason.title }); setReasonDialog(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={() => setReportReasons(p => p.filter(r => r.id !== reason.id))}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Currency */}
          <TabsContent value="currency" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold">Currency Settings</h3>
              <Dialog open={currencyDialog} onOpenChange={setCurrencyDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-1 text-xs" onClick={() => setEditingCurrency({ name: "", symbol: "", countryCode: "", currencyCode: "" })}>
                    <Plus className="h-4 w-4" /> Add Currency
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a1a2e] border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>{editingCurrency.id ? "Edit" : "Add"} Currency</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <SettingField label="Name">
                      <Input className={inputClass} value={editingCurrency.name} onChange={e => setEditingCurrency(p => ({ ...p, name: e.target.value }))} />
                    </SettingField>
                    <SettingField label="Symbol">
                      <Input className={inputClass} value={editingCurrency.symbol} onChange={e => setEditingCurrency(p => ({ ...p, symbol: e.target.value }))} />
                    </SettingField>
                    <SettingField label="Country Code">
                      <Input className={inputClass} value={editingCurrency.countryCode} onChange={e => setEditingCurrency(p => ({ ...p, countryCode: e.target.value }))} />
                    </SettingField>
                    <SettingField label="Currency Code">
                      <Input className={inputClass} value={editingCurrency.currencyCode} onChange={e => setEditingCurrency(p => ({ ...p, currencyCode: e.target.value }))} />
                    </SettingField>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSaveCurrency} className="bg-purple-600 hover:bg-purple-700">Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="border border-gray-700/50 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-transparent">
                    <TableHead className="text-gray-400">Name</TableHead>
                    <TableHead className="text-gray-400">Symbol</TableHead>
                    <TableHead className="text-gray-400">Country Code</TableHead>
                    <TableHead className="text-gray-400">Currency Code</TableHead>
                    <TableHead className="text-gray-400">Default</TableHead>
                    <TableHead className="text-gray-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currencies.map(currency => (
                    <TableRow key={currency.id} className="border-gray-700/50 hover:bg-purple-600/5">
                      <TableCell className="text-white">{currency.name}</TableCell>
                      <TableCell className="text-white">{currency.symbol}</TableCell>
                      <TableCell className="text-gray-400">{currency.countryCode}</TableCell>
                      <TableCell className="text-gray-400">{currency.currencyCode}</TableCell>
                      <TableCell>
                        <Star className={`h-4 w-4 cursor-pointer ${currency.isDefault ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}`} onClick={() => setCurrencies(p => p.map(c => ({ ...c, isDefault: c.id === currency.id })))} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => { setEditingCurrency(currency); setCurrencyDialog(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={() => setCurrencies(p => p.filter(c => c.id !== currency.id))}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Withdrawal */}
          <TabsContent value="withdrawal" className="space-y-4 mt-4">
            <SettingSection title="Minimum Coin Setting">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <SettingField label="Currency">
                  <Select value={withdrawal.currency} onValueChange={v => setWithdrawal(p => ({ ...p, currency: v }))}>
                    <SelectTrigger className={inputClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(c => (
                        <SelectItem key={c.id} value={c.currencyCode}>{c.name} ({c.symbol})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SettingField>
                <SettingField label="Coins">
                  <Input className={inputClass} value={withdrawal.coins} onChange={e => setWithdrawal(p => ({ ...p, coins: e.target.value }))} />
                </SettingField>
                <SettingField label="Min Coins Payout (User)">
                  <Input className={inputClass} value={withdrawal.minCoinsPayoutUser} onChange={e => setWithdrawal(p => ({ ...p, minCoinsPayoutUser: e.target.value }))} />
                </SettingField>
                <SettingField label="Min Coins Payout (Agency)">
                  <Input className={inputClass} value={withdrawal.minCoinsPayoutAgency} onChange={e => setWithdrawal(p => ({ ...p, minCoinsPayoutAgency: e.target.value }))} />
                </SettingField>
              </div>
            </SettingSection>
          </TabsContent>

          {/* Profile Management */}
          <TabsContent value="profile-management" className="space-y-4 mt-4">
            <SettingSection title="Default Profile Images">
              <div className="flex flex-wrap gap-6">
                {profileImages.map((img, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500/50">
                      <img src={img} alt={`Profile ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 text-xs h-7" onClick={() => setProfileImages(p => p.filter((_, idx) => idx !== i))}>
                      <X className="h-3 w-3 mr-1" /> Remove
                    </Button>
                  </div>
                ))}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-purple-500/50 transition-colors">
                    <Plus className="h-8 w-8 text-gray-500" />
                  </div>
                  <span className="text-gray-500 text-xs">Upload</span>
                </div>
              </div>
            </SettingSection>
          </TabsContent>

          {/* Audio Management */}
          <TabsContent value="audio-management" className="space-y-4 mt-4">
            <SettingSection title="Audio Files">
              <div className="flex flex-wrap gap-6">
                {audioFiles.map(audio => (
                  <div key={audio.id} className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 rounded-full bg-purple-600/20 border-2 border-purple-500/50 flex items-center justify-center cursor-pointer" onClick={() => setPlayingAudio(playingAudio === audio.id ? null : audio.id)}>
                      {playingAudio === audio.id ? <Pause className="h-8 w-8 text-purple-400" /> : <Play className="h-8 w-8 text-purple-400" />}
                    </div>
                    <span className="text-white text-xs font-medium">{audio.name}</span>
                    <span className="text-gray-500 text-xs">{audio.duration}</span>
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 text-xs h-7" onClick={() => setAudioFiles(p => p.filter(a => a.id !== audio.id))}>
                      <X className="h-3 w-3 mr-1" /> Remove
                    </Button>
                  </div>
                ))}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-purple-500/50 transition-colors">
                    <Upload className="h-8 w-8 text-gray-500" />
                  </div>
                  <span className="text-gray-500 text-xs">Upload Audio</span>
                </div>
              </div>
            </SettingSection>
          </TabsContent>

          {/* Video Management */}
          <TabsContent value="video-management" className="space-y-4 mt-4">
            <SettingSection title="Video Files">
              <div className="flex flex-wrap gap-6">
                {videoFiles.map(video => (
                  <div key={video.id} className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500/50 relative">
                      <img src={video.thumbnail} alt={video.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <span className="text-white text-xs font-medium">{video.name}</span>
                    <span className="text-gray-500 text-xs">{video.duration}</span>
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 text-xs h-7" onClick={() => setVideoFiles(p => p.filter(v => v.id !== video.id))}>
                      <X className="h-3 w-3 mr-1" /> Remove
                    </Button>
                  </div>
                ))}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-purple-500/50 transition-colors">
                    <Upload className="h-8 w-8 text-gray-500" />
                  </div>
                  <span className="text-gray-500 text-xs">Upload Video</span>
                </div>
              </div>
            </SettingSection>
          </TabsContent>

          {/* Game */}
          <TabsContent value="game" className="space-y-4 mt-4">
            <SettingSection title="Game Bet Management">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SettingField label={`Bet ${i} (Coin)`}>
                      <Input className={inputClass} value={(game as any)[`bet${i}`]} onChange={e => setGame(p => ({ ...p, [`bet${i}`]: e.target.value }))} />
                    </SettingField>
                    <SettingField label={`Bet ${i} Description`}>
                      <Input className={inputClass} value={(game as any)[`bet${i}Description`]} onChange={e => setGame(p => ({ ...p, [`bet${i}Description`]: e.target.value }))} />
                    </SettingField>
                  </div>
                ))}
              </div>
            </SettingSection>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
