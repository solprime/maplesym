import Image from "next/image";
import Holysymbol from "../images/holysymbol.png";

export default function Header() {
  return (
    <header className="w-full flex items-center justify-between border-b border-gray-200 py-4 mb-8 px-4 bg-slate-900 text-white">
      <a href="#" className="flex gap-3">
        <Image src={Holysymbol} alt="홀리심볼 아이콘" width={40} height={40} />
        <h1 className="text-2xl font-bold">메랜심</h1>
      </a>
      <nav>
        <ul className="flex space-x-4">
          <li>
            <a href="#" className="text-white hover:text-gray-500">
              공지사항
            </a>
          </li>
          <li>
            <a href="#" className="text-white hover:text-gray-500">
              커뮤니티
            </a>
          </li>
          <li>
            <a href="#" className="text-white hover:text-gray-500">
              건의사항
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
