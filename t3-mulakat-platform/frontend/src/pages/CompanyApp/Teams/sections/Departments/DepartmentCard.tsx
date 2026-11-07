// import {
//     TableRow,
//     TableCell,
// } from '@mui/material';
// import { useTranslation } from 'react-i18next';
// import { PencilEdit02Icon } from 'hugeicons-react';

// type PropTypes = {
//     department: any;
//     handleOpen: ({ mode, id }: {
//         mode: 'create' | 'update';
//         id?: string;
//     }) => void;
// };

// const DepartmentCard = ({ department, handleOpen }: PropTypes) => {
//     const { t } = useTranslation();

//     return (
//         <>
//             <TableRow>
//                 <TableCell>{department?.name}</TableCell>
//                 <TableCell>{department?.description ?? ""}</TableCell>
//                 <TableCell align='center'>
//                     <div
//                         className='flex justify-center items-center hover:bg-slate-100 cursor-pointer gap-1  w-max rounded'
//                         onClick={() => handleOpen({ mode: 'update', id: department?._id })}
//                     >
//                         <p className='text-[#36CBFF] font-medium py-1 pl-2'>
//                             {t('edit')}
//                         </p>
//                         <PencilEdit02Icon size={18} color='#36CBFF' />
//                     </div>
//                 </TableCell>
//             </TableRow>
//         </>
//     );
// };

// export default DepartmentCard;
