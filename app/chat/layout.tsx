import SideBar from "@/components/side-bar";

const Page = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="h-screen bg-gray-100 flex p-3">
      <SideBar />
      {children}
    </div>
  );
};
export default Page;
