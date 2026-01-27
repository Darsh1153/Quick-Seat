import React from 'react'
import { assets } from '../../assets/assets'
import { LayoutDashboardIcon, ListCollapseIcon, ListIcon, PlusSquareIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
    const user = {
        firstName: "Admin",
        lastName: "User",
        imageUrl: assets.profile,
    }

    const adminNavlinks = [
        { name: "Dashboard", path: "/admin", icon: LayoutDashboardIcon },
        { name: "Add Shows", path: "/admin/add-show", icon: PlusSquareIcon },
        { name: "List Bookings", path: "/admin/list-bookings", icon: ListIcon },
        { name: "List Shows", path: "/admin/list-shows", icon: ListCollapseIcon },
    ];

    return (
        <div className='h-[calc(100vh-64px)] w-60 border-r border-gray-300/20 flex md:flex-col items-center'>
            <img src={user.imageUrl} alt='img' className='w-9 h-9 md:h-14 md:w-14 rounded-full mx-auto mt-10' />
            <p className='mt-2'>{user.firstName} {user.lastName}</p>

            <div className='w-full mt-5'>
                {adminNavlinks.map((link, index) => {
                    return (
                        <NavLink
                            end
                            key={index}
                            to={link.path}
                            className={({ isActive }) =>
                                `relative flex items-center gap-2 w-full py-2.5 pl-10 text-gray-400
     ${isActive ? 'bg-primary/15 text-primary group' : ''}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <link.icon className="w-5 h-5" />
                                    <p className='max-md:hidden'>{link.name}</p>
                                    <span className={`w-1.5 h-10 rounded-l right-0 absolute
                                ${isActive && "bg-primmary"}`}></span>
                                </>
                            )}
                        </NavLink>

                    )
                })}
            </div>
        </div>
    )
}

export default Sidebar
