import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogOut, Trash2, Plus, Shield, ImageIcon, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  getBeforeAfterImages,
  addBeforeAfterImage,
  removeBeforeAfterImage,
  updateAdminCredentials,
  getAdminUsername,
  BeforeAfterImage,
} from "@/lib/beforeAfterStore";
import PageTransition from "@/components/PageTransition";
import logo from "@/assets/logo.png";

const credSchema = z.object({
  username: z.string().trim().min(3, "Min 3 characters").max(50),
  password: z.string().min(6, "Min 6 characters").max(100),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const imageSchema = z.object({
  title: z.string().trim().min(1, "Required").max(100),
  titleFa: z.string().trim().min(1, "Required").max(100),
  category: z.string().trim().min(1, "Required").max(50),
});

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [images, setImages] = useState<BeforeAfterImage[]>([]);

  // Credential form
  const [credUsername, setCredUsername] = useState("");
  const [credPassword, setCredPassword] = useState("");
  const [credConfirm, setCredConfirm] = useState("");
  const [credError, setCredError] = useState("");
  const [showCredPassword, setShowCredPassword] = useState(false);
  const [showCredConfirm, setShowCredConfirm] = useState(false);

  // Image form
  const [imgTitle, setImgTitle] = useState("");
  const [imgTitleFa, setImgTitleFa] = useState("");
  const [imgCategory, setImgCategory] = useState("");
  const [imgBefore, setImgBefore] = useState("");
  const [imgAfter, setImgAfter] = useState("");
  const [imgError, setImgError] = useState("");

  useEffect(() => {
    if (!sessionStorage.getItem("moaser_admin_session")) {
      navigate("/admin/login");
      return;
    }
    setImages(getBeforeAfterImages());
    setCredUsername(getAdminUsername());
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("moaser_admin_session");
    navigate("/admin/login");
  };

  const handleCredUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredError("");
    const result = credSchema.safeParse({ username: credUsername, password: credPassword, confirmPassword: credConfirm });
    if (!result.success) {
      setCredError(result.error.errors[0].message);
      return;
    }
    await updateAdminCredentials(result.data.username, result.data.password);
    setCredPassword("");
    setCredConfirm("");
    toast({ title: "Credentials updated", description: "Your admin credentials have been changed." });
  };

  const handleFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setImgError("");
    const result = imageSchema.safeParse({ title: imgTitle, titleFa: imgTitleFa, category: imgCategory });
    if (!result.success) {
      setImgError(result.error.errors[0].message);
      return;
    }
    if (!imgBefore || !imgAfter) {
      setImgError("Both before and after images are required.");
      return;
    }
    addBeforeAfterImage({
      title: result.data.title,
      titleFa: result.data.titleFa,
      beforeImage: imgBefore,
      afterImage: imgAfter,
      category: result.data.category,
    });
    setImages(getBeforeAfterImages());
    setImgTitle("");
    setImgTitleFa("");
    setImgCategory("");
    setImgBefore("");
    setImgAfter("");
    toast({ title: "Image added", description: "Before/After image has been added." });
  };

  const handleDelete = (id: string) => {
    removeBeforeAfterImage(id);
    setImages(getBeforeAfterImages());
    toast({ title: "Deleted", description: "Image removed successfully." });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <img src={logo} alt="Moaser Dental Hospital" className="h-8 w-8 sm:h-9 sm:w-9 object-contain shrink-0" />
              <h1 className="font-heading text-base sm:text-xl font-bold text-foreground truncate">Admin Dashboard</h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="shrink-0">
              <LogOut className="w-4 h-4 sm:ltr:mr-2 sm:rtl:ml-2" /> <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
          <Tabs defaultValue="images">
            <TabsList className="mb-6">
              <TabsTrigger value="images" className="gap-2"><ImageIcon className="w-4 h-4" /> Before & After</TabsTrigger>
              <TabsTrigger value="credentials" className="gap-2"><Shield className="w-4 h-4" /> Credentials</TabsTrigger>
            </TabsList>

            {/* --- Before/After Images Tab --- */}
            <TabsContent value="images" className="space-y-6">
              {/* Add form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><Plus className="w-5 h-5" /> Add New Image</CardTitle>
                  <CardDescription>Upload before and after treatment photos.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddImage} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title (English)</Label>
                        <Input value={imgTitle} onChange={(e) => setImgTitle(e.target.value)} maxLength={100} />
                      </div>
                      <div className="space-y-2">
                        <Label>Title (فارسی)</Label>
                        <Input value={imgTitleFa} onChange={(e) => setImgTitleFa(e.target.value)} maxLength={100} dir="rtl" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input value={imgCategory} onChange={(e) => setImgCategory(e.target.value)} placeholder="e.g. implant, cosmetic, orthodontics" maxLength={50} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Before Image</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 10 * 1024 * 1024) {
                                setImgError("Image must be under 10MB");
                                return;
                              }
                              setImgBefore(await handleFileToBase64(file));
                            }
                          }}
                        />
                        {imgBefore && <img src={imgBefore} alt="Before preview" className="w-20 h-20 object-cover rounded-lg border border-border" />}
                      </div>
                      <div className="space-y-2">
                        <Label>After Image</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 10 * 1024 * 1024) {
                                setImgError("Image must be under 10MB");
                                return;
                              }
                              setImgAfter(await handleFileToBase64(file));
                            }
                          }}
                        />
                        {imgAfter && <img src={imgAfter} alt="After preview" className="w-20 h-20 object-cover rounded-lg border border-border" />}
                      </div>
                    </div>
                    {imgError && <p className="text-sm text-destructive">{imgError}</p>}
                    <Button type="submit"><Plus className="w-4 h-4 ltr:mr-2 rtl:ml-2" /> Add Image</Button>
                  </form>
                </CardContent>
              </Card>

              {/* Image list */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Existing Images ({images.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {images.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No images yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Preview</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {images.map((img) => (
                          <TableRow key={img.id}>
                            <TableCell>
                              <div className="flex gap-2">
                                <img src={img.beforeImage} alt="Before" className="w-12 h-12 object-cover rounded border border-border" />
                                <img src={img.afterImage} alt="After" className="w-12 h-12 object-cover rounded border border-border" />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{img.title}</TableCell>
                            <TableCell className="text-muted-foreground">{img.category}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(img.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- Credentials Tab --- */}
            <TabsContent value="credentials">
              <Card className="max-w-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><Shield className="w-5 h-5" /> Change Credentials</CardTitle>
                  <CardDescription>Update your admin username and password.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCredUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Username</Label>
                      <Input value={credUsername} onChange={(e) => setCredUsername(e.target.value)} maxLength={50} />
                    </div>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <div className="relative">
                        <Input type={showCredPassword ? "text" : "password"} value={credPassword} onChange={(e) => setCredPassword(e.target.value)} maxLength={100} />
                        <button type="button" onClick={() => setShowCredPassword(!showCredPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showCredPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <div className="relative">
                        <Input type={showCredConfirm ? "text" : "password"} value={credConfirm} onChange={(e) => setCredConfirm(e.target.value)} maxLength={100} />
                        <button type="button" onClick={() => setShowCredConfirm(!showCredConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showCredConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    {credError && <p className="text-sm text-destructive">{credError}</p>}
                    <Button type="submit">Update Credentials</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </PageTransition>
  );
}
