import React from 'react'
import { Link } from 'react-router-dom'

export default function ConditionalLink({ children, condition, ...props }) {
  return condition && props.to ? <Link {...props}>{children}</Link> : <div {...props}>{children}</div>
}