import React from 'react';
import {Route} from 'react-router-dom';

import { List as {{{titleUcFirst}}}List, Create as {{{titleUcFirst}}}Create, Update as {{{titleUcFirst}}}Update } from './components/{{{lc}}}/';

export default (
    [
        <Route path='/{{{lc}}}/' component={ {{{titleUcFirst}}}List } exact={true} strict={true}/>,
        <Route path='/{{{lc}}}/create' component={ {{{titleUcFirst}}}Create } exact={true} />,
        <Route path="/{{{lc}}}/edit/:id" component={ {{{titleUcFirst}}}Update } exact={true}/>
    ]
);