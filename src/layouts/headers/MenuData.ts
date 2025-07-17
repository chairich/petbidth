 
 
interface DataType  {
  id: number;
  title: string;
  link: string;
  has_dropdown: boolean;
  sub_menus?: {
      link: string;
      title: string;
      inner_has_dropdown?: boolean;
      inner_sub?: {
        link: string,
        title: string,
      }[];
  }[];
}

// menu data
const menu_data:DataType[] = [
	{
		id: 1,
		title: "หน้าแรก",
		link: "/",
		has_dropdown: false,
		sub_menus: [
			{ link: "/", title: "Home Variation 1" },
			
		],
	},
	
	{
		id: 6,
		title: "ชุมชนแบ่งบัน",
		link: "/",
		has_dropdown: false,
	},
];
export default menu_data;
