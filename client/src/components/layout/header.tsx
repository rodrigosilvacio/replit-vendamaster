interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      </div>
    </header>
  );
}
