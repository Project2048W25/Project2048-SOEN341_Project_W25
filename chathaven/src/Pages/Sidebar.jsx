const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 h-full p-4 flex flex-col">
      <div className="text-xl font-bold mb-4">ChatHaven</div>
      <div className="mb-4">
        <div className="text-sm font-semibold">User</div>
      </div>
      <div className="flex-1">
        <div className="mb-2">Direct Messages</div>
        <button className="bg-gray-700 p-2 rounded w-full text-left">+</button>
        <div className="mt-4">Teams</div>
        <button className="bg-gray-700 p-2 rounded w-full text-left">+</button>
      </div>
    </aside>
  );
};

export default Sidebar;
